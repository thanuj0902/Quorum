export type AgentId = 'researcher' | 'verifier' | 'contradiction' | 'synthesizer'

export interface Agent {
  id: AgentId
  label: string
  icon: string
  description: string
  status: string
}

export interface ConfidenceFactor {
  value: number
  weight: number
  contribution: number
}

export interface ConfidenceBreakdown {
  source_agreement: ConfidenceFactor
  source_reliability: ConfidenceFactor
  contradiction_penalty: ConfidenceFactor
  base_score: ConfidenceFactor
  status_adjustment: number
  formula: string
}

export interface Claim {
  claim: string
  source: string
  source_url?: string
  confidence: number
  confidence_breakdown?: ConfidenceBreakdown
  verification_status: 'verified' | 'partially_verified' | 'unverified' | 'contradicted'
  supporting_sources: string[]
  contradicting_sources: string[]
  reasoning?: string
  agent_scores?: Partial<Record<AgentId, number>>
}

export type FlagType = 'none' | 'direct_contradiction' | 'unsubstantiated'

export interface HallucinationFlag {
  claim: string
  flag_type: FlagType
  is_hallucination: boolean
  reason: string
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  contradicting_sources?: string[]
  evidence_gaps?: string
}

export interface PipelineLogEntry {
  agent: AgentId
  status: string
  message: string
  duration: number
}

export interface VerificationReport {
  topic: string
  overall_confidence: number
  summary: string
  confidence_reasoning?: string
  claims: Claim[]
  hallucinations: HallucinationFlag[]
  pipeline_log: PipelineLogEntry[]
  total_duration?: number
}

export interface PipelineState {
  activeAgent: AgentId | null
  completedAgents: AgentId[]
  agentMessages: Partial<Record<AgentId, string>>
  agentTimers: Partial<Record<AgentId, string>>
  currentLog: string
}

export type PipelinePhase = 'idle' | 'running' | 'complete'

export interface ConfidenceClasses {
  bg: string
  text: string
  border: string
  gradient: string
}

// Routing
export type AppView = 'landing' | 'pipeline' | 'batch' | 'history' | 'report'

// History
export interface HistoryEntry {
  id: string
  topic: string
  overall_confidence: number
  summary: string
  claims_count: number
  verified_count: number
  partial_count: number
  flagged_count: number
  timestamp: number
  fullReport: VerificationReport
}

// Batch
export interface BatchResult {
  topic: string
  report: VerificationReport | null
  status: 'pending' | 'running' | 'complete' | 'error'
  error?: string
}

// Toast
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
