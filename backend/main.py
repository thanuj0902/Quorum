import os
import re
import json
import time
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import httpx

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quorum")

app = FastAPI(title="Quorum", version="2.1.0", description="Multi-agent AI fact-verification system")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://quorum-liart.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MAX_TOPIC_LENGTH = 500
MAX_RETRIES = 2


class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=MAX_TOPIC_LENGTH)


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
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-sonnet-4-20250514",
                        "max_tokens": 8192,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": user_prompt}],
                    },
                )
                response.raise_for_status()
                data = response.json()

                if "content" not in data or not data["content"]:
                    raise ValueError(f"Unexpected API response structure: {data}")

                return data["content"][0]["text"]
        except (httpx.HTTPStatusError, httpx.RequestError, ValueError, KeyError, IndexError) as e:
            last_error = e
            logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES:
                await _async_delay(1000 * (attempt + 1))

    raise HTTPException(status_code=502, detail=f"LLM API failed after {MAX_RETRIES + 1} attempts: {last_error}")


def _async_delay(ms: int):
    import asyncio
    return asyncio.sleep(ms / 1000)


def parse_agent_json(raw: str, agent_name: str) -> list | dict:
    try:
        parsed = json.loads(clean_json(raw))
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"{agent_name} returned invalid JSON: {e}")
        raise HTTPException(status_code=502, detail=f"{agent_name} returned invalid JSON. Please retry.")


async def research_agent(topic: str, api_key: str) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    system = (
        "You are the Research Agent in a multi-agent fact-verification system called Quorum. "
        "Your job is to extract factual, verifiable claims from research topics. "
        "For each claim, you MUST provide a detailed 'reasoning' field explaining your evidence and confidence. "
        "Never fabricate claims — if uncertain about a fact, lower the confidence score. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Analyze the topic: "{safe_topic}"

Extract 6-10 key factual claims. For each, provide:
- claim: the factual statement (be specific, avoid vague claims)
- source: primary source reference (publication, organization, or research institution)
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
        "message": f"Extracted {len(claims)} claims from multiple sources",
        "duration": round(duration, 2),
    }


async def verifier_agent(claims: list[dict], topic: str, api_key: str) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} (Source: {c.get('source', 'unknown')}, Category: {c.get('category', 'general')}, Confidence: {c.get('confidence', 0)})"
        for c in claims
    ])

    system = (
        "You are the Cross-Verification Agent in Quorum's multi-agent pipeline. "
        "Your job is to independently verify each claim against multiple reliable sources. "
        "You must provide detailed 'reasoning' for each verification decision. "
        "Track supporting AND contradicting sources separately. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Verify these claims about: "{safe_topic}"

Claims to verify:
{claims_text}

For EACH claim:
1. Cross-reference against your knowledge of multiple reliable sources
2. Determine: verified, partially_verified, unverified, or contradicted
3. List specific supporting sources (institution names, publications)
4. List specific contradicting sources if any exist
5. Adjust confidence based on source agreement
6. Provide detailed reasoning explaining your verification decision

Return a JSON array with exactly these fields per claim:
claim, source, confidence (0.0-1.0), verification_status, supporting_sources (array of source names), contradicting_sources (array of source names), reasoning (1-2 sentences explaining verification)'''

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
        f"- {c.get('claim', '')} [Status: {c.get('verification_status', 'unknown')}, Confidence: {c.get('confidence', 0)}, Sources: {', '.join(c.get('supporting_sources', [])[:3])}]"
        for c in verified_claims
    ])

    system = (
        "You are the Contradiction and Hallucination Detector in Quorum's multi-agent pipeline. "
        "Your job is to find contradictions between claims and detect hallucinated or fabricated information. "
        "You must provide detailed reasoning for each flag. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Analyze these verified claims about: "{safe_topic}"

Claims:
{claims_text}

For EACH claim, analyze:
- is_hallucination: true/false — is this claim fabricated or significantly distorted?
- reason: detailed explanation (2-3 sentences) of why it is or is not a hallucination
- severity: none, low, medium, high, critical
- evidence_gaps: what additional evidence would strengthen or weaken this claim?

Also provide an OVERALL_ASSESSMENT entry with claim="OVERALL_ASSESSMENT" summarizing:
- Total claims analyzed
- Hallucinations found
- Overall source quality assessment

Return a JSON array with: claim, is_hallucination, reason, severity, evidence_gaps.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    flags = parse_agent_json(result, "Contradiction Detector")
    duration = time.time() - start

    flagged = sum(1 for f in flags if f.get("is_hallucination"))
    severe = sum(1 for f in flags if f.get("severity") in ("high", "critical"))
    logger.info(f"Contradiction Detector: {flagged} hallucinations found ({severe} severe) in {duration:.2f}s")
    return flags, {
        "agent": "contradiction",
        "status": "done",
        "message": f"{flagged} issues flagged ({severe} high-severity)",
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
    halluc_data = [h for h in hallucinations if h.get("is_hallucination")]

    system = (
        "You are the Synthesis and Confidence Agent in Quorum's multi-agent pipeline. "
        "Your job is to compile a citation-backed report with accurate confidence scores. "
        "You must provide detailed reasoning for the overall confidence assessment. "
        "Return ONLY valid JSON — no markdown, no explanation outside the JSON."
    )
    prompt = f'''Compile a report on: "{safe_topic}"

Verified Claims:
{claims_text}

Hallucination Flags: {json.dumps(halluc_data)}

Calculate overall_confidence (0.0-1.0) based on:
- Percentage of claims that were verified vs unverified/contradicted
- Average confidence of verified claims
- Severity of any hallucinations detected
- Source agreement across claims

Write a 3-5 sentence executive summary that:
1. States the overall reliability of the research
2. Highlights the strongest findings
3. Notes the most contested or uncertain claims
4. Provides actionable confidence guidance

Return JSON with exactly these fields:
{{
  "overall_confidence": float (0.0-1.0),
  "summary": "detailed executive summary",
  "confidence_reasoning": "1-2 sentence explanation of how confidence was calculated"
}}'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    report_data = parse_agent_json(result, "Synthesizer")
    duration = time.time() - start

    conf = report_data.get("overall_confidence", 0)
    logger.info(f"Synthesizer: overall confidence={conf} in {duration:.2f}s")
    return report_data, {
        "agent": "synthesizer",
        "status": "done",
        "message": f"Report compiled — {round(conf * 100)}% overall confidence",
        "duration": round(duration, 2),
    }


@app.post("/api/research")
async def research(request: ResearchRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    pipeline_log = []
    pipeline_start = time.time()

    try:
        claims, log1 = await research_agent(request.topic, api_key)
        pipeline_log.append(log1)

        verified, log2 = await verifier_agent(claims, request.topic, api_key)
        pipeline_log.append(log2)

        hallucinations, log3 = await contradiction_agent(verified, request.topic, api_key)
        pipeline_log.append(log3)

        report_data, log4 = await synthesizer_agent(request.topic, verified, hallucinations, api_key)
        pipeline_log.append(log4)

        total_duration = round(time.time() - pipeline_start, 2)

        return {
            "status": "success",
            "report": {
                "topic": request.topic,
                "overall_confidence": report_data.get("overall_confidence", 0),
                "summary": report_data.get("summary", ""),
                "confidence_reasoning": report_data.get("confidence_reasoning", ""),
                "claims": verified,
                "hallucinations": hallucinations,
                "pipeline_log": pipeline_log,
                "total_duration": total_duration,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Pipeline processing failed. Please try again.")


@app.get("/api/health")
async def health():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    return {
        "status": "ok",
        "service": "Quorum",
        "version": "2.1.0",
        "api_key_configured": bool(api_key),
        "pipeline_agents": ["researcher", "verifier", "contradiction", "synthesizer"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
