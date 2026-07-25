# Quorum — Multi-Agent Research & Fact-Verification System

Four AI agents research, cross-verify, detect hallucinations, and compile citation-backed reports — with real-time pipeline visualization, history, shareable links, batch mode, and PDF export.

## Architecture

```
Topic Input
    │
    ▼
┌─────────────────┐
│  Researcher     │ ── Multi-source claim extraction
└────────┬────────┘
         ▼
┌─────────────────────┐
│ Cross-Verifier      │ ── Independent cross-referencing
└────────┬────────────┘
         ▼
┌──────────────────────────┐
│ Contradiction Detector   │ ── Hallucination & conflict detection
└────────┬─────────────────┘
         ▼
┌──────────────────┐
│ Synthesizer      │ ── Citation-backed report with confidence scores
└──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Python 3, FastAPI, Groq (Llama 3.1 70B) |
| **Web Search** | DuckDuckGo (free, no key) + Brave Search (optional) |
| **Deploy** | Vercel (frontend) + Render (backend) |

## Features

### Core Pipeline
| Feature | Description |
|---------|-------------|
| **4-Agent Pipeline** | Research → Verify → Detect → Synthesize, each as a separate LLM call |
| **Real-time Visualization** | Animated agent handoff with glowing connections and live terminal log |
| **Claim-Level Report** | Expandable cards with confidence scores, reasoning, supporting/contradicting sources |
| **Source Trust Ledger** | Ranked source reliability with trust bars |
| **Pipeline Performance** | Per-agent timing breakdown |

### History & Sharing (P1)
| Feature | Description |
|---------|-------------|
| **Report History** | localStorage-persisted history with session stats (total reports, claims, avg confidence, flagged) |
| **Delete Entries** | Remove individual history items |
| **Shareable Links** | Hash-based routing (`/#reportId`) — read-only standalone report view |
| **Copy Share Link** | One-click clipboard copy with toast confirmation |

### Batch & Export (P2)
| Feature | Description |
|---------|-------------|
| **Batch Verify** | Add 2-5 claims, run all through pipeline, side-by-side comparison grid |
| **PDF Export** | Quorum-branded printable report via browser print dialog |
| **Toast Notifications** | Feedback for copy/save/share actions |

### Polish
| Feature | Description |
|---------|-------------|
| **Demo Mode** | Full animated pipeline without API key — perfect for presentations |
| **Live Mode** | Real backend verification with Anthropic API |
| **Fallback** | Auto-falls back to demo if backend is unavailable |
| **Input Validation** | Friendly error states for edge cases |
| **Responsive** | Horizontal pipeline on desktop, vertical on mobile |

## Quick Start

### Demo Mode (no API key needed)
```bash
git clone https://github.com/thanuj0902/Quorum.git
cd Quorum
npm install
npm run dev
# Open http://localhost:5173
# Click "Watch it verify a claim" → auto-runs demo pipeline
```

### Full Mode (with Groq API — free)
```bash
# Backend
cd backend
pip install -r requirements.txt
echo "GROQ_API_KEY=gsk-..." > .env
python main.py

# Frontend (separate terminal)
cd ..
npm run dev
```

## Project Structure

```
Quorum/
├── src/
│   ├── components/
│   │   ├── Landing/        # Hero, HowItWorks, WhyDifferent, Metrics
│   │   ├── Pipeline/       # PipelineView, PipelineVisualizer, BatchView
│   │   ├── Report/         # ClaimCard, ConfidenceReport, SourceTrustLedger
│   │   ├── History/        # HistoryView, ReportView
│   │   └── ui/             # Logo, ShareMenu, Toast, ErrorBoundary
│   ├── hooks/              # usePipeline, useHistory, useToast
│   ├── data/               # Agent configs, demo report data
│   ├── types/              # TypeScript interfaces
│   ├── lib/                # Utilities (cn)
│   ├── utils/              # Colors, PDF export
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── main.py             # FastAPI with 4 agent endpoints
│   └── requirements.txt
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## Design System

| Token | Value |
|-------|-------|
| Background | `#0A0A0B` |
| Surface | `#111114` |
| Border | `#222230` |
| Accent | `#7C3AED` (purple) |
| Green | `#34D399` |
| Yellow | `#FBBF24` |
| Red | `#F87171` |
| Fonts | Space Grotesk (display), Inter (body), JetBrains Mono (mono) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Free API key from console.groq.com (Llama 3.1 70B) |
| `BRAVE_API_KEY` | No | Optional Brave Search key (better search quality, free tier: 2000/month) |

## License

MIT
