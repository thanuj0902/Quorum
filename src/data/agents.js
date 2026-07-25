export const AGENT_IDS = ['researcher', 'verifier', 'contradiction', 'synthesizer']

export const AGENTS = [
  { id: 'researcher', label: 'Researcher', icon: '◎', status: 'Extracting claims from sources...' },
  { id: 'verifier', label: 'Verifier', icon: '◇', status: 'Cross-checking claims...' },
  { id: 'contradiction', label: 'Contradiction Detector', icon: '△', status: 'Scanning for conflicts...' },
  { id: 'synthesizer', label: 'Synthesizer', icon: '□', status: 'Compiling report...' },
]

export const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]))

export const PIPELINE_TIMING = {
  INIT_DELAY: 800,
  AGENT_MESSAGE_MIN: 700,
  AGENT_MESSAGE_MAX: 1200,
  AGENT_COMPLETE_DELAY: 400,
  LIVE_AGENT_MIN: 1500,
  LIVE_AGENT_MAX: 2500,
  FALLBACK_DELAY: 1000,
  PREVIEW_AGENT_INTERVAL: 1800,
  PREVIEW_LOG_INTERVAL: 2200,
  PREVIEW_RESET_DELAY: 2000,
  DEMO_START_DELAY: 500,
}
