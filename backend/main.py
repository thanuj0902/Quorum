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
logger = logging.getLogger("factcheck")

app = FastAPI(title="FactCheck AI", version="2.0.0")

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
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-sonnet-4-20250514",
                        "max_tokens": 4096,
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
        "You are the Research Agent. Extract factual claims from research topics. "
        "Return ONLY valid JSON. Never fabricate claims — if uncertain, lower the confidence score."
    )
    prompt = f'''Analyze the topic: "{safe_topic}"

Extract 8-12 key factual claims. For each, provide:
- claim: the factual statement
- source: source reference (publication, organization, or URL)
- confidence: initial confidence 0.0-1.0
- category: one of [statistic, historical, scientific, financial, technical, general]

Return a JSON array. No markdown, no explanation.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    claims = parse_agent_json(result, "Research Agent")
    duration = time.time() - start

    logger.info(f"Research Agent: {len(claims)} claims in {duration:.2f}s")
    return claims, {
        "agent": "researcher",
        "input_data": {"topic": safe_topic},
        "output_data": {"claims_count": len(claims)},
        "duration": round(duration, 2),
    }


async def verifier_agent(claims: list[dict], topic: str, api_key: str) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} (Source: {c.get('source', 'unknown')}, Category: {c.get('category', 'general')})"
        for c in claims
    ])

    system = (
        "You are the Cross-Verification Agent. Independently verify each claim against multiple sources. "
        "Return ONLY valid JSON. If a claim cannot be verified, mark it as unverified."
    )
    prompt = f'''Verify these claims about: "{safe_topic}"

Claims:
{claims_text}

For EACH claim:
1. Cross-reference against your knowledge of multiple reliable sources
2. Determine: verified, partially_verified, unverified, or contradicted
3. List supporting and contradicting sources
4. Adjust confidence based on verification (higher if multiple sources agree)

Return a JSON array with: claim, source, confidence, verification_status, supporting_sources, contradicting_sources.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    verified = parse_agent_json(result, "Verification Agent")
    duration = time.time() - start

    logger.info(f"Verification Agent: {len(verified)} claims verified in {duration:.2f}s")
    return verified, {
        "agent": "verifier",
        "input_data": {"claims_count": len(claims)},
        "output_data": {"verified_count": len(verified)},
        "duration": round(duration, 2),
    }


async def contradiction_agent(verified_claims: list[dict], topic: str, api_key: str) -> tuple[list[dict], dict]:
    safe_topic = sanitize_input(topic)
    claims_text = "\n".join([
        f"- {c.get('claim', '')} [Status: {c.get('verification_status', 'unknown')}, Confidence: {c.get('confidence', 0)}]"
        for c in verified_claims
    ])

    system = (
        "You are the Contradiction and Hallucination Detector. Find contradictions between claims "
        "and detect hallucinated or fabricated claims. Return ONLY valid JSON."
    )
    prompt = f'''Analyze these verified claims about: "{safe_topic}"

Claims:
{claims_text}

For EACH claim, determine:
- is_hallucination: true/false
- reason: explanation of why it is or is not a hallucination
- severity: none, low, medium, high, critical

Also add an OVERALL_ASSESSMENT entry with claim="OVERALL_ASSESSMENT".

Return a JSON array with: claim, is_hallucination, reason, severity.'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    flags = parse_agent_json(result, "Contradiction Detector")
    duration = time.time() - start

    flagged = sum(1 for f in flags if f.get("is_hallucination"))
    logger.info(f"Contradiction Detector: {flagged} flagged in {duration:.2f}s")
    return flags, {
        "agent": "contradiction",
        "input_data": {"claims_count": len(verified_claims)},
        "output_data": {"flags_count": len(flags), "hallucinations_found": flagged},
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
        f"- {c.get('claim', '')} [Status: {c.get('verification_status', 'unknown')}, Confidence: {c.get('confidence', 0)}]"
        for c in verified_claims
    ])
    halluc_data = [h for h in hallucinations if h.get("is_hallucination")]

    system = (
        "You are the Synthesis and Confidence Agent. Compile a citation-backed report with confidence scores. "
        "Return ONLY valid JSON."
    )
    prompt = f'''Compile a report on: "{safe_topic}"

Verified Claims:
{claims_text}

Hallucination Flags: {json.dumps(halluc_data)}

Calculate overall_confidence (0.0-1.0) based on:
- How many claims were verified vs unverified
- Average confidence of verified claims
- Whether hallucinations were detected

Write a 3-5 sentence executive summary.

Return JSON: {{"overall_confidence": float, "summary": "string"}}'''

    start = time.time()
    result = await call_llm(system, prompt, api_key)
    report_data = parse_agent_json(result, "Synthesizer")
    duration = time.time() - start

    logger.info(f"Synthesizer: confidence={report_data.get('overall_confidence', 0)} in {duration:.2f}s")
    return report_data, {
        "agent": "synthesizer",
        "input_data": {"claims_count": len(verified_claims)},
        "output_data": {"confidence": report_data.get("overall_confidence", 0)},
        "duration": round(duration, 2),
    }


@app.post("/api/research")
async def research(request: ResearchRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    pipeline_log = []

    try:
        claims, log1 = await research_agent(request.topic, api_key)
        pipeline_log.append(log1)

        verified, log2 = await verifier_agent(claims, request.topic, api_key)
        pipeline_log.append(log2)

        hallucinations, log3 = await contradiction_agent(verified, request.topic, api_key)
        pipeline_log.append(log3)

        report_data, log4 = await synthesizer_agent(request.topic, verified, hallucinations, api_key)
        pipeline_log.append(log4)

        return {
            "status": "success",
            "report": {
                "topic": request.topic,
                "overall_confidence": report_data.get("overall_confidence", 0),
                "summary": report_data.get("summary", ""),
                "claims": verified,
                "hallucinations": hallucinations,
                "pipeline_log": pipeline_log,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Pipeline processing failed. Please try again.")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "FactCheck AI v2"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
