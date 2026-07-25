import type { Agent, AgentId } from '../types'

export const AGENT_IDS: AgentId[] = ['researcher', 'verifier', 'contradiction', 'synthesizer']

export const AGENTS: Agent[] = [
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

export const AGENT_MAP: Record<AgentId, Agent> = Object.fromEntries(
  AGENTS.map(a => [a.id, a])
) as Record<AgentId, Agent>
