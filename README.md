# Quorum — Autonomous Multi-Agent Research & Fact-Verification System

Four independent AI agents research, cross-verify, detect hallucinations, and compile citation-backed reports — each as a separate LLM call. Built for InnovaHack Gen AI PS1.

## Live Demo

- **Frontend**: https://quorum-liart.vercel.app
- **Backend**: https://quorum-production-4df3.up.railway.app

## Architecture

```
Topic Input
    │
    ▼
┌─────────────────┐
│  Research Agent │ ── Extracts claims from live web sources     [Key A]
└────────┬────────┘
         ▼
┌─────────────────────┐
│ Verification Agent  │ ── Cross-checks each claim independently [Key B]
└────────┬────────────┘
         ▼
┌──────────────────────────┐
│ Contradiction Detector   │ ── Flags hallucinations & conflicts [Key C]
└────────┬─────────────────┘
         ▼
┌──────────────────┐
│ Synthesis Agent  │ ── Compiles citation-backed report          [Key A]
└──────────────────┘
         │
         ▼
  Per-claim confidence scores with weighted formula breakdown
  Clickable source URLs from real DuckDuckGo search results
  Source Trust Ledger with cross-source agreement rates
```

Each agent is a **separate `call_llm()` invocation** — not a single prompt split into sections. Agents consume each other's actual output sequentially.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Charts** | Recharts (Source Trust Ledger) |
| **PDF Export** | jsPDF |
| **Backend** | Python 3.11, FastAPI, Groq Llama 3.1 8B Instant |
| **Web Search** | DuckDuckGo (free, no API key) |
| **Voice Input** | Web Speech API (SpeechRecognition) |
| **Deployment** | Vercel (frontend) + Railway (backend) |

## API Keys

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Key A — Research + Synthesis agents |
| `GROQ_API_KEY_2` | Yes | Key B — Verification agent |
| `GROQ_API_KEY_3` | Yes | Key C — Contradiction agent |
| `BRAVE_API_KEY` | No | Optional fallback search provider |

All Groq keys are free at https://console.groq.com. Three keys ensure zero rate-limit contention — each agent has a dedicated key.

## Features

### Core Pipeline
| Feature | Description |
|---------|-------------|
| **4-Agent Pipeline** | Research → Verify → Detect → Synthesize, each as a separate LLM call |
| **Real-time SSE Streaming** | Frontend connects directly to Railway for live agent activation |
| **Per-Claim Confidence** | Individual 0-100% score with weighted formula breakdown (source agreement 40%, reliability 25%, contradiction 25%, base 10%) |
| **Citation-Backed** | Every claim linked to real DuckDuckGo URLs — clickable hyperlinks |
| **Two Contradiction Types** | `direct_contradiction` (sources disagree) vs `unsubstantiated` (hallucination) — labeled distinctly |
| **Source Trust Ledger** | Ranked source reliability with trust bars and cross-source agreement rates |

### History & Sharing
| Feature | Description |
|---------|-------------|
| **Report History** | localStorage + server-persisted history with session stats |
| **Shareable Links** | Hash-based URLs for cross-device read-only report access |
| **PDF Export** | Multi-page A4 report via jsPDF |
| **Batch Verify** | Compare 2-5 claims side by side |

### UI/UX
| Feature | Description |
|---------|-------------|
| **Dark/Light Mode** | Theme toggle with localStorage persistence |
| **Voice Input** | Web Speech API mic button for speaking claims |
| **Responsive** | Horizontal pipeline on desktop, vertical step list on mobile (375px) |
| **Pipeline Visualizer** | Animated agent handoff with glowing connections and live terminal log |
| **Toast Notifications** | Feedback for copy/save/share actions |

## Project Structure

```
Quorum/
├── src/
│   ├── components/
│   │   ├── Landing/        # LandingView, Hero, HowItWorks, WhyDifferent, Metrics, FAQ
│   │   ├── Pipeline/       # PipelineView, PipelineVisualizer, BatchView
│   │   ├── Report/         # ClaimCard, ConfidenceReport, SourceTrustLedger
│   │   ├── History/        # HistoryView, ReportView
│   │   └── ui/             # Logo, ThemeToggle, AnimatedNumber, ShareMenu, Toast, ErrorBoundary
│   ├── hooks/              # usePipeline, useHistory, useVoiceInput, useTheme, useToast
│   ├── data/               # Agent configs
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # colors, pdf, status
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── main.py             # FastAPI — 4 agents, SSE streaming, confidence calculation
│   ├── requirements.txt
│   └── .env.example
├── api/
│   └── og.tsx              # Open Graph image generation
├── Dockerfile              # Railway deployment
├── vercel.json             # Vercel rewrites + CSP headers
├── tsconfig.json
└── vite.config.ts
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/thanuj0902/Quorum.git
cd Quorum
npm install

# Run frontend
npm run dev
# Open http://localhost:5173

# Run backend (separate terminal)
cd backend
pip install -r requirements.txt
echo "GROQ_API_KEY=gsk-your-key" > .env
python main.py
# Backend runs on http://localhost:8000
```

## PS Requirements Coverage

| # | Requirement | Implementation |
|---|-------------|---------------|
| 1 | Background alignment | Hero.tsx states hallucination problem |
| 2 | 4 distinct agents | 4 separate `call_llm()` in main.py |
| 3 | Agents check each other | Real output piped sequentially |
| 4 | Citation-backed report | All claims have clickable source URLs |
| 5 | Per-claim confidence | Individual scores with formula breakdown |
| 6 | Live search API | DuckDuckGo as primary (not fallback) |
| 7 | Pipeline Visualizer | Real-time SSE streaming via Railway |
| 8 | Mobile responsive | Vertical step list at 375px |
| 9 | Two contradiction types | `direct_contradiction` + `unsubstantiated` |
| 10 | Source Trust Ledger | Recharts bar chart + agreement rate |
| 11 | Expandable claim cards | Factor breakdown with weighted formula |
| 12 | Voice Input | Web Speech API |
| 13 | History/Saved Reports | localStorage + server, with delete |
| 14 | Shareable Report Link | Hash-based URL, cross-device |
| 15 | Framer Motion | Rich in visualizer, subtle elsewhere |
| 16 | Responsive (375/768/1440) | Tailwind breakpoints |
| 17 | PDF/Export | jsPDF multi-page |

## License

MIT
