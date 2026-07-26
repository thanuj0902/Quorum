import os
import re
import json
import time
import asyncio
import random
import logging
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import httpx
from duckduckgo_search import DDGS

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quorum")

app = FastAPI(title="Quorum", version="3.1.0", description="Multi-agent AI fact-verification system")

MAX_TOPIC_LENGTH = 500
MAX_RETRIES = 2
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 5

rate_limit_store: dict[str, list[float]] = defaultdict(list)


class RateLimitMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        client = scope.get("client")
        if not client:
            return await self.app(scope, receive, send)

        ip = client[0]
        now = time.time()
        rate_limit_store[ip] = [t for t in rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW]

        if len(rate_limit_store[ip]) >= RATE_LIMIT_MAX:
            from starlette.responses import JSONResponse
            response = JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please wait a moment and try again."},
            )
            return await response(scope, receive, send)

        rate_limit_store[ip].append(now)
        return await self.app(scope, receive, send)


ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://quorum-liart.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.add_middleware(RateLimitMiddleware)


class NoCacheMiddleware:
    """Prevent caching of API responses by adding Cache-Control: no-store."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        path = scope.get("path", "")
        if path.startswith("/api/"):
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    headers.append((b"cache-control", b"no-store, no-cache, must-revalidate"))
                    message["headers"] = headers
                return await send(message)
            return await self.app(scope, receive, send_wrapper)

        return await self.app(scope, receive, send)


app.add_middleware(NoCacheMiddleware)


class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=MAX_TOPIC_LENGTH)
    stream: bool = Field(default=False)


class BatchRequest(BaseModel):
    topics: list[str] = Field(..., min_length=1, max_length=5)
    stream: bool = Field(default=False)


def sanitize_input(text: str) -> str:
    text = text.strip()
    text = re.sub(r'[<>"{}]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text[:MAX_TOPIC_LENGTH]


def clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
    return text.strip()


async def call_llm(system_prompt: str, user_prompt: str, api_key: str) -> str:
    errors = []

    # Provider 1: Groq (fastest) — retry up to 3 times with backoff on 429
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                        json={
                            "model": "llama-3.1-8b-instant",
                            "max_tokens": 4096,
                            "temperature": 0.2,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        if "choices" in data and data["choices"]:
                            return data["choices"][0]["message"]["content"]
                    elif response.status_code == 429:
                        retry_after = int(response.headers.get("retry-after", 5 + attempt * 10))
                        logger.warning(f"Groq rate limited (attempt {attempt+1}/3), waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue
                    else:
                        errors.append(f"Groq: HTTP {response.status_code}")
                        logger.warning(f"Groq returned {response.status_code}")
            except Exception as e:
                errors.append(f"Groq: {e}")
                logger.warning(f"Groq failed: {e}")
        errors.append("Groq: exhausted retries")

    # Provider 2: Gemini (fallback)
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={gemini_key}",
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                            "generationConfig": {"maxOutputTokens": 4096, "temperature": 0.2},
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text
                    elif response.status_code == 429:
                        wait = 5 + attempt * 15
                        logger.warning(f"Gemini rate limited (attempt {attempt+1}/3), waiting {wait}s")
                        await asyncio.sleep(wait)
                    else:
                        errors.append(f"Gemini: HTTP {response.status_code}")
            except Exception as e:
                errors.append(f"Gemini attempt {attempt + 1}: {e}")
                logger.warning(f"Gemini failed: {e}")
                await asyncio.sleep(1)

    logger.error(f"All providers failed: {errors}")
    raise HTTPException(status_code=502, detail=f"Providers failed: {'; '.join(errors)}")


def parse_agent_json(raw: str, agent_name: str) -> list | dict:
    try:
        parsed = json.loads(clean_json(raw))
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"{agent_name} returned invalid JSON: {e}")
        raise HTTPException(status_code=502, detail=f"{agent_name} returned invalid JSON. Please retry.")


# --- Web Search (GUARANTEED — no paid API required) ---

def _ddg_search_sync(query: str, max_results: int = 5) -> list[dict]:
    """Single DuckDuckGo search attempt (sync, runs in thread)."""
    try:
        ddgs = DDGS(timeout=10)
        results = list(ddgs.text(query, max_results=max_results))
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "content": r.get("body", ""),
                "score": 0.5,
            }
            for r in results
        ]
    except Exception as e:
        logger.warning(f"DuckDuckGo search error: {e}")
        return []


async def duckduckgo_search(query: str, max_results: int = 5) -> list[dict]:
    """DuckDuckGo with retry logic and query variations. Always returns results."""
    loop = asyncio.get_event_loop()

    # Attempt 1: exact query
    results = await loop.run_in_executor(None, _ddg_search_sync, query, max_results)
    if results:
        return results

    # Attempt 2: simplified query (remove special chars, shorten)
    simple = re.sub(r'[^\w\s]', '', query).strip()[:100]
    if simple != query:
        logger.info(f"DuckDuckGo retry with simplified query: '{simple[:50]}'")
        results = await loop.run_in_executor(None, _ddg_search_sync, simple, max_results)
        if results:
            return results

    # Attempt 3: first N words only
    words = query.split()[:6]
    short = " ".join(words)
    if short != query and short != simple:
        logger.info(f"DuckDuckGo retry with short query: '{short}'")
        results = await loop.run_in_executor(None, _ddg_search_sync, short, max_results)
        if results:
            return results

    logger.error(f"DuckDuckGo: all attempts failed for '{query[:50]}'")
    return []


async def brave_search(query: str, max_results: int = 5) -> list[dict]:
    """Search via Brave Search API (free tier: 2000 queries/month)."""
    api_key = os.getenv("BRAVE_API_KEY")
    if not api_key:
        return []

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://api.search.brave.com/res/v1/web/search",
                headers={"X-Subscription-Token": api_key, "Accept": "application/json"},
                params={"q": query, "count": max_results},
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for r in data.get("web", {}).get("results", []):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("description", ""),
                    "score": 0.8,
                })
            return results
    except Exception as e:
        logger.warning(f"Brave search failed: {e}")
        return []


async def web_search(query: str, max_results: int = 5) -> list[dict]:
    """Guaranteed web search. DuckDuckGo (always free, no key) + Brave (optional, better quality)."""
    # Try DuckDuckGo first (always works, no API key)
    results = await duckduckgo_search(query, max_results)
    if results:
        logger.info(f"Search OK (DuckDuckGo): {len(results)} results for '{query[:50]}'")
        return results

    # Fallback: Brave Search (free tier, needs key)
    results = await brave_search(query, max_results)
    if results:
        logger.info(f"Search OK (Brave): {len(results)} results for '{query[:50]}'")
        return results

    # Last resort: return empty but log error
    logger.error(f"Search FAILED: no results from any provider for '{query[:50]}'")
    return []


# --- Confidence Calculation (Algorithmic) ---

SOURCE_TIER = {
    "peer_reviewed": 1.0,
    "government": 0.95,
    "major_news": 0.85,
    "industry_report": 0.80,
    "organization": 0.75,
    "blog": 0.50,
    "unknown": 0.60,
}


def get_source_tier(source_name: str) -> float:
    name_lower = source_name.lower()
    if any(k in name_lower for k in ["nature", "science", "lancet", "jama", "bmj", "cell", "pnas"]):
        return SOURCE_TIER["peer_reviewed"]
    if any(k in name_lower for k in ["fda", "cdc", "nih", "nhs", "who", "government"]):
        return SOURCE_TIER["government"]
    if any(k in name_lower for k in ["reuters", "ap ", "bbc", "nyt", "washington post", "guardian", "ft "]):
        return SOURCE_TIER["major_news"]
    if any(k in name_lower for k in ["mckinsey", "deloitte", "pwc", "gartner", "bloomberg", "forbes", "wsj"]):
        return SOURCE_TIER["industry_report"]
    if any(k in name_lower for k in ["university", "institute", "center", "council", "association"]):
        return SOURCE_TIER["organization"]
    if any(k in name_lower for k in ["blog", "medium", "substack", "personal"]):
        return SOURCE_TIER["blog"]
    return SOURCE_TIER["unknown"]


def calculate_claim_confidence(
    claim: dict,
    hallucination_flags: list[dict],
    supporting_sources: list[str],
    contradicting_sources: list[str],
) -> float:
    """Algorithmic confidence calculation based on structured factors."""
    # Factor 1: Source agreement rate
    total_sources = len(supporting_sources) + len(contradicting_sources)
    if total_sources > 0:
        agreement_rate = len(supporting_sources) / total_sources
    else:
        agreement_rate = 0.5

    # Factor 2: Source reliability (average tier of supporting sources)
    if supporting_sources:
        avg_reliability = sum(get_source_tier(s) for s in supporting_sources) / len(supporting_sources)
    else:
        avg_reliability = SOURCE_TIER["unknown"]

    # Factor 3: Contradiction penalty
    contradiction_penalty = 0.0
    for flag in hallucination_flags:
        if flag.get("claim", "") == claim.get("claim", ""):
            severity = flag.get("severity", "none")
            if flag.get("is_hallucination"):
                contradiction_penalty = 0.6
            elif severity == "critical":
                contradiction_penalty = 0.5
            elif severity == "high":
                contradiction_penalty = 0.35
            elif severity == "medium":
                contradiction_penalty = 0.2
            elif severity == "low":
                contradiction_penalty = 0.1
            break

    # Factor 4: Base confidence from verification status
    status_bonus = {
        "verified": 0.15,
        "partially_verified": 0.0,
        "unverified": -0.2,
        "contradicted": -0.35,
    }
    status_adj = status_bonus.get(claim.get("verification_status", "unverified"), 0)

    # Weighted formula
    raw_score = (
        agreement_rate * 0.40
        + avg_reliability * 0.25
        + (1 - contradiction_penalty) * 0.25
        + 0.50 * 0.10  # base score
    )
    raw_score += status_adj

    return max(0.05, min(0.99, round(raw_score, 2)))


# --- Agents ---

async def research_agent(topic: str, api_key: str, search_results: list[dict] | None = None) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)

    # Build context from real search results if available
    search_context = ""
    if search_results:
        search_context = "\n\nREAL WEB SEARCH RESULTS (use these as primary sources):\n"
        for i, r in enumerate(search_results[:5], 1):
            search_context += f"\n{i}. {r['title']}\n   URL: {r['url']}\n   Content: {r['content'][:300]}\n"

    system = (
        "You are the Research Agent in a multi-agent fact-verification system called Quorum. "
        "Your job is to extract factual, verifiable claims from research topics. "
        "When web search results are provided, use them as your PRIMARY sources and cite their URLs. "
        "For each claim, you MUST provide a detailed 'reasoning' field explaining your evidence and confidence. "
        "Never fabricate claims — if uncertain about a fact, lower the confidence score. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Analyze the topic: "{safe_topic}"
{search_context}

Extract 4-6 key factual claims. For each, provide:
- claim: the factual statement (be specific, avoid vague claims)
- source: primary source reference (publication, organization, or research institution)
- source_url: URL of the source if available (from search results)
- confidence: initial confidence 0.0-1.0 based on how well-sourced the claim is
- category: one of [statistic, historical, scientific, financial, technical, general]
- reasoning: a 1-2 sentence explanation of why this claim is made and what evidence supports it

Return a JSON array. No markdown, no explanation.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    claims = parse_agent_json(result, "Research Agent")
    duration = time.time() - start

    logger.info(f"Research Agent: {len(claims)} claims extracted in {duration:.2f}s")
    return claims, {
        "agent": "researcher",
        "status": "done",
        "message": f"Extracted {len(claims)} claims from {len(search_results or [])} web sources",
        "duration": round(duration, 2),
    }


async def verifier_agent(claims: list[dict], topic: str, api_key: str, search_results: list[dict] | None = None) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} (Source: {c.get('source', 'unknown')}, Category: {c.get('category', 'general')}, Confidence: {c.get('confidence', 0)})"
        for c in claims
    ])

    search_context = ""
    if search_results:
        search_context = "\n\nADDITIONAL WEB SEARCH RESULTS for cross-verification:\n"
        for i, r in enumerate(search_results[:5], 1):
            search_context += f"\n{i}. {r['title']}\n   URL: {r['url']}\n   Content: {r['content'][:200]}\n"

    system = (
        "You are the Cross-Verification Agent in Quorum's multi-agent pipeline. "
        "Your job is to independently verify each claim against multiple reliable sources. "
        "When web search results are provided, use them for cross-verification. "
        "You must provide detailed 'reasoning' for each verification decision. "
        "Track supporting AND contradicting sources separately. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Verify these claims about: "{safe_topic}"

Claims to verify:
{claims_text}
{search_context}

For EACH claim:
1. Cross-reference against multiple reliable sources
2. Determine: verified, partially_verified, unverified, or contradicted
3. List specific supporting sources (institution names, publications)
4. List specific contradicting sources if any exist
5. Adjust confidence based on source agreement
6. Provide detailed reasoning explaining your verification decision

Return a JSON array with exactly these fields per claim:
claim, source, source_url, confidence (0.0-1.0), verification_status, supporting_sources (array of source names), contradicting_sources (array of source names), reasoning (1-2 sentences explaining verification)'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    verified = parse_agent_json(result, "Verification Agent")
    duration = time.time() - start

    verified_count = sum(1 for v in verified if v.get("verification_status") == "verified")
    partial_count = sum(1 for v in verified if v.get("verification_status") == "partially_verified")
    logger.info(f"Verification Agent: {verified_count} verified, {partial_count} partial in {duration:.2f}s")
    return verified, {
        "agent": "verifier",
        "status": "done",
        "message": f"{verified_count} verified, {partial_count} partial out of {len(verified)} claims",
        "duration": round(duration, 2),
    }


async def contradiction_agent(verified_claims: list[dict], topic: str, api_key: str) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} [Status: {c.get('verification_status', 'unknown')}, Confidence: {c.get('confidence', 0)}, Supporting: {', '.join(c.get('supporting_sources', [])[:3])}, Contradicting: {', '.join(c.get('contradicting_sources', [])[:3])}]"
        for c in verified_claims
    ])

    system = (
        "You are the Contradiction and Hallucination Detector in Quorum's multi-agent pipeline. "
        "Your job is to detect TWO distinct types of issues:\n"
        "1. DIRECT CONTRADICTIONS — where two or more sources give conflicting information about the same claim\n"
        "2. UNSUBSTANTIATED CLAIMS / HALLUCINATIONS — where a claim cannot be substantiated by any independent source\n\n"
        "You MUST label each issue with the correct type. "
        "Provide detailed reasoning for each flag. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Analyze these verified claims about: "{safe_topic}"

Claims:
{claims_text}

For EACH claim, analyze:
- flag_type: one of "none", "direct_contradiction", "unsubstantiated"
  - "direct_contradiction": sources disagree with each other on this claim
  - "unsubstantiated": no independent source can verify this claim (hallucination)
- reason: detailed explanation (2-3 sentences) of why this flag was or was not raised
- severity: none, low, medium, high, critical
- contradicting_sources: list of sources that contradict this claim (if direct_contradiction)
- evidence_gaps: what additional evidence would strengthen or weaken this claim?

Also provide an OVERALL_ASSESSMENT entry with claim="OVERALL_ASSESSMENT" summarizing:
- Total claims analyzed
- Direct contradictions found
- Unsubstantiated/hallucinated claims found
- Overall source quality assessment

Return a JSON array with: claim, flag_type, reason, severity, contradicting_sources, evidence_gaps.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    flags = parse_agent_json(result, "Contradiction Detector")
    duration = time.time() - start

    contradictions = sum(1 for f in flags if f.get("flag_type") == "direct_contradiction")
    hallucinations = sum(1 for f in flags if f.get("flag_type") == "unsubstantiated")
    severe = sum(1 for f in flags if f.get("severity") in ("high", "critical"))
    logger.info(f"Contradiction Detector: {contradictions} contradictions, {hallucinations} hallucinations ({severe} severe) in {duration:.2f}s")
    return flags, {
        "agent": "contradiction",
        "status": "done",
        "message": f"{contradictions} contradictions, {hallucinations} hallucinations ({severe} high-severity)",
        "duration": round(duration, 2),
    }


async def synthesizer_agent(
    topic: str,
    verified_claims: list[dict],
    hallucinations: list[dict],
    api_key: str,
) -> tuple[dict, dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} [Status: {c.get('verification_status', 'unknown')}, Confidence: {c.get('confidence', 0)}, Reasoning: {c.get('reasoning', 'N/A')[:100]}]"
        for c in verified_claims
    ])
    flag_data = [h for h in hallucinations if h.get("flag_type") != "none"]

    system = (
        "You are the Synthesis and Confidence Agent in Quorum's multi-agent pipeline. "
        "Your job is to compile a citation-backed report with accurate confidence scores. "
        "The confidence scores have been ALREADY CALCULATED ALGORITHMICALLY — you must use them as provided. "
        "Write a 3-5 sentence executive summary. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Compile a report on: "{safe_topic}"

Verified Claims (with algorithmically calculated confidence):
{claims_text}

Flags: {json.dumps(flag_data)}

Write a 3-5 sentence executive summary that:
1. States the overall reliability of the research
2. Highlights the strongest findings
3. Notes the most contested or uncertain claims
4. Provides actionable confidence guidance

Return JSON with exactly these fields:
{{
  "summary": "detailed executive summary",
  "confidence_reasoning": "1-2 sentence explanation of the confidence assessment"
}}'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    report_data = parse_agent_json(result, "Synthesizer")
    duration = time.time() - start

    logger.info(f"Synthesizer: report compiled in {duration:.2f}s")
    return report_data, {
        "agent": "synthesizer",
        "status": "done",
        "message": "Report compiled with citation-backed confidence scores",
        "duration": round(duration, 2),
    }


# --- Pipeline execution ---

async def run_pipeline(topic: str, api_key: str):
    pipeline_log = []
    pipeline_start = time.time()

    # Step 0: Web search
    logger.info(f"[Pipeline] Starting search for: {topic[:50]}")
    search_results = await web_search(topic, max_results=5)
    logger.info(f"[Pipeline] Search returned {len(search_results)} results")

    # Step 1: Research
    logger.info("[Pipeline] Starting research agent")
    claims, log1 = await research_agent(topic, api_key, search_results)
    pipeline_log.append(log1)
    yield {"event": "agent_complete", "data": json.dumps(log1)}

    # Rate limit: wait for token regeneration (~100 tokens/sec on Groq free tier)
    await asyncio.sleep(12)

    # Step 2: Verify
    logger.info("[Pipeline] Starting verifier agent")
    verified, log2 = await verifier_agent(claims, topic, api_key, search_results)
    pipeline_log.append(log2)
    yield {"event": "agent_complete", "data": json.dumps(log2)}

    await asyncio.sleep(12)

    # Step 3: Contradiction detection
    logger.info("[Pipeline] Starting contradiction agent")
    flags, log3 = await contradiction_agent(verified, topic, api_key)
    pipeline_log.append(log3)
    yield {"event": "agent_complete", "data": json.dumps(log3)}

    # Step 4: Calculate algorithmic confidence for each claim
    for claim in verified:
        supp = claim.get("supporting_sources", [])
        contra = claim.get("contradicting_sources", [])
        algo_conf = calculate_claim_confidence(claim, flags, supp, contra)
        claim["confidence"] = algo_conf
        claim["agent_scores"] = {
            "researcher": round(claim.get("confidence", 0.5), 2),
            "verifier": round(algo_conf, 2),
            "source_agreement": round(len(supp) / max(1, len(supp) + len(contra)), 2),
            "source_reliability": round(sum(get_source_tier(s) for s in supp) / max(1, len(supp)), 2),
        }

    await asyncio.sleep(12)

    # Step 5: Synthesize
    logger.info("[Pipeline] Starting synthesizer agent")
    report_data, log4 = await synthesizer_agent(topic, verified, flags, api_key)
    pipeline_log.append(log4)
    yield {"event": "agent_complete", "data": json.dumps(log4)}

    # Calculate overall confidence from claim-level scores
    if verified:
        overall_confidence = round(sum(c.get("confidence", 0.5) for c in verified) / len(verified), 2)
    else:
        overall_confidence = 0.5

    total_duration = round(time.time() - pipeline_start, 2)

    report = {
        "topic": topic,
        "overall_confidence": overall_confidence,
        "summary": report_data.get("summary", ""),
        "confidence_reasoning": report_data.get("confidence_reasoning", ""),
        "claims": verified,
        "hallucinations": flags,
        "pipeline_log": pipeline_log,
        "total_duration": total_duration,
    }

    yield {"event": "complete", "data": json.dumps({"status": "success", "report": report})}


# --- API Endpoints ---

@app.post("/api/research")
async def research(request: ResearchRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    if request.stream:
        async def event_generator():
            async for event in run_pipeline(request.topic, api_key):
                yield f"event: {event['event']}\ndata: {event['data']}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # Non-streaming: collect all events and return final result
    try:
        result = None
        async for event in run_pipeline(request.topic, api_key):
            if event["event"] == "complete":
                result = json.loads(event["data"])

        if result:
            return result
        raise HTTPException(status_code=500, detail="Pipeline failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Pipeline error: {str(e)[:200]}")


@app.post("/api/batch")
async def batch_verify(request: BatchRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    results = []
    for idx, topic in enumerate(request.topics):
        topic = sanitize_input(topic)
        if len(topic) < 3:
            results.append({"topic": topic, "status": "error", "error": "Topic too short"})
            continue

        # Delay between batch items to respect rate limits
        if idx > 0:
            await asyncio.sleep(10)

        try:
            # Reuse the same combined pipeline
            report_result = None
            async for event in run_pipeline(topic, api_key):
                if event["event"] == "complete":
                    report_result = json.loads(event["data"])

            if report_result:
                results.append({"topic": topic, "status": "success", "report": report_result["report"]})
            else:
                results.append({"topic": topic, "status": "error", "error": "Pipeline failed"})
        except Exception as e:
            logger.error(f"Batch item failed: {e}")
            results.append({"topic": topic, "status": "error", "error": str(e)[:200]})

    return {"status": "success", "results": results}


@app.on_event("startup")
async def startup_check():
    api_key = os.getenv("GROQ_API_KEY")
    brave_key = os.getenv("BRAVE_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY not set — pipeline will fail")
    else:
        logger.info("Groq API key configured")
    if brave_key:
        logger.info("Brave Search API configured (primary search)")
    else:
        logger.info("BRAVE_API_KEY not set — using DuckDuckGo for web search (free, no key needed)")


@app.get("/api/health")
async def health():
    api_key = os.getenv("GROQ_API_KEY")
    brave_key = os.getenv("BRAVE_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "ok",
        "service": "Quorum",
        "version": "3.1.0",
        "providers": {
            "groq": bool(api_key),
            "gemini": bool(gemini_key),
        },
        "api_key_configured": bool(api_key),
        "search_provider": "brave" if brave_key else "duckduckgo",
        "pipeline_agents": ["researcher", "verifier", "contradiction", "synthesizer"],
    }


@app.get("/api/test-llm")
async def test_llm():
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    results = {}

    if groq_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={"model": "llama-3.1-8b-instant", "max_tokens": 50, "messages": [{"role": "user", "content": "Say OK"}]},
                )
                results["groq"] = {"status": resp.status_code, "ok": resp.status_code == 200}
                if resp.status_code != 200:
                    results["groq"]["error"] = resp.text[:300]
        except Exception as e:
            results["groq"] = {"status": "error", "error": str(e)[:300]}
    else:
        results["groq"] = {"status": "no_key"}

    if gemini_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={gemini_key}",
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": "Say OK"}]}], "generationConfig": {"maxOutputTokens": 50}},
                )
                results["gemini"] = {"status": resp.status_code, "ok": resp.status_code == 200}
                if resp.status_code != 200:
                    results["gemini"]["error"] = resp.text[:300]
        except Exception as e:
            results["gemini"] = {"status": "error", "error": str(e)[:300]}
    else:
        results["gemini"] = {"status": "no_key"}

    return results


@app.get("/api/test-search")
async def test_search():
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, _ddg_search_sync, "climate change", 3)
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
