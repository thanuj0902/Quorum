# FactCheck AI — Multi-Agent Research & Fact-Verification System

**INNOVA HACK 2026 | Gen AI Track | Problem Statement 1**

Four AI agents research, cross-verify, detect hallucinations, and compile citation-backed reports — with real-time pipeline visualization.

## Architecture

```
Topic Input
    │
    ▼
┌─────────────────┐
│  Researcher     │ ── Extracts claims & sources
└────────┬────────┘
         ▼
┌─────────────────────┐
│ Cross-Verifier      │ ── Independently checks each claim
└────────┬────────────┘
         ▼
┌──────────────────────────┐
│ Contradiction Detector   │ ── Finds conflicts & hallucinations
└────────┬─────────────────┘
         ▼
┌──────────────────┐
│ Synthesizer      │ ── Citation-backed report + confidence scores
└──────────────────┘
```

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS + Framer Motion
- **Backend**: Python + FastAPI + Anthropic/Claude API
- **Design**: Linear/Vercel-grade dark theme, Space Grotesk + Inter fonts

## Quick Start

### Demo Mode (no API key needed)
```bash
cd factcheck-ai-v2
npm install
npm run dev
# Open http://localhost:5173
# Click "Watch it verify a claim" → auto-runs demo pipeline
```

### Full Mode (with Anthropic API)
```bash
# Backend
cd backend
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
python main.py

# Frontend (separate terminal)
cd ..
npm run dev
```

### Deploy to Vercel
```bash
npm run build
# Deploy dist/ to Vercel
# Set ANTHROPIC_API_KEY as environment variable
```

## Features

| Module | Description |
|--------|-------------|
| **Research Agent** | Extracts factual claims from multiple sources |
| **Cross-Verification Agent** | Independently verifies each claim (separate API call) |
| **Contradiction Detector** | Flags conflicts, hallucinations, and imprecise claims |
| **Synthesizer** | Citation-backed report with per-claim confidence scores |
| **Pipeline Visualizer** | Real-time animated agent handoff (the demo moment) |
| **Claim-Level Report** | Expandable cards with sources, confidence tiers, flags |
| **Source Trust Ledger** | Running record of source reliability across the session |

## Project Structure

```
factcheck-ai-v2/
├── src/
│   ├── components/
│   │   ├── Landing/     # Hero, PipelinePreview, HowItWorks, WhyDifferent
│   │   ├── Pipeline/    # PipelineVisualizer, AgentNode
│   │   └── Report/      # ClaimCard, ConfidenceReport, SourceTrustLedger
│   ├── hooks/           # usePipeline (demo + live mode)
│   ├── data/            # Demo data for hackathon presentation
│   ├── App.jsx
│   └── index.css
├── backend/
│   ├── main.py          # FastAPI with 4 separate agent API calls
│   └── requirements.txt
└── vercel.json
```

## Demo Mode

Click "Watch it verify a claim" on the landing page to run a full animated pipeline with simulated multi-agent data. No API key required — perfect for hackathon presentations.
