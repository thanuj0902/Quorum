export const AGENT_IDS = ['researcher', 'verifier', 'contradiction', 'synthesizer']

export const AGENTS = [
  {
    id: 'researcher',
    label: 'Researcher',
    icon: '◎',
    description: 'Multi-source claim extraction',
    status: 'Extracting claims from sources...',
  },
  {
    id: 'verifier',
    label: 'Verifier',
    icon: '◇',
    description: 'Independent cross-referencing',
    status: 'Cross-checking claims...',
  },
  {
    id: 'contradiction',
    label: 'Contradiction',
    icon: '△',
    description: 'Hallucination & conflict detection',
    status: 'Scanning for conflicts...',
  },
  {
    id: 'synthesizer',
    label: 'Synthesizer',
    icon: '□',
    description: 'Citation-backed report synthesis',
    status: 'Compiling report...',
  },
]

export const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]))

export const PIPELINE_TIMING = {
  INIT_DELAY: 800,
  AGENT_MESSAGE_MIN: 600,
  AGENT_MESSAGE_MAX: 1000,
  AGENT_COMPLETE_DELAY: 300,
  LIVE_AGENT_MIN: 1200,
  LIVE_AGENT_MAX: 2200,
  FALLBACK_DELAY: 800,
  PREVIEW_AGENT_INTERVAL: 1800,
  PREVIEW_LOG_INTERVAL: 2200,
  PREVIEW_RESET_DELAY: 2000,
  DEMO_START_DELAY: 500,
}
