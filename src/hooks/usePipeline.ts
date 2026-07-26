import { useState, useCallback, useRef } from 'react'
import { AGENT_IDS, AGENT_MAP } from '../data/agents'
import type { PipelineState, PipelinePhase, VerificationReport, AgentId } from '../types'

const RAILWAY_URL = import.meta.env.VITE_API_URL || 'https://quorum-production-4df3.up.railway.app'

interface UsePipelineReturn {
  phase: PipelinePhase
  pipelineState: PipelineState
  report: VerificationReport | null
  error: string | null
  runLivePipeline: (topic: string) => Promise<void>
  runBatchPipeline: (topics: string[]) => Promise<{ topic: string; report: VerificationReport | null; status: string; error?: string }[]>
}

export function usePipeline(): UsePipelineReturn {
  const [phase, setPhase] = useState<PipelinePhase>('idle')
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    activeAgent: null,
    completedAgents: [],
    agentMessages: {},
    agentTimers: {},
    currentLog: '',
  })
  const [report, setReport] = useState<VerificationReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completedCountRef = useRef(0)
  const agentStartTimes = useRef<Record<string, number>>({})
  const phaseRef = useRef<PipelinePhase>('idle')

  const updateState = useCallback((updates: Partial<PipelineState>) => {
    setPipelineState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetPipeline = useCallback(() => {
    setError(null)
    setReport(null)
    completedCountRef.current = 0
    agentStartTimes.current = {}
    setPipelineState({
      activeAgent: null,
      completedAgents: [],
      agentMessages: {},
      agentTimers: {},
      currentLog: 'Initializing multi-agent pipeline...',
    })
  }, [])

  const runLivePipeline = useCallback(async (topic: string): Promise<void> => {
    resetPipeline()
    setPhase('running')
    phaseRef.current = 'running'
    updateState({ currentLog: 'Connecting to multi-agent backend...' })

    try {
      const res = await fetch(`${RAILWAY_URL}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, stream: true }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail || `HTTP ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response stream')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const raw of events) {
          const lines = raw.split('\n')
          let eventType = ''
          let eventData = ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6)
            }
          }

          if (!eventType || !eventData) continue

          try {
            const parsed = JSON.parse(eventData)

            if (eventType === 'agent_start') {
              const agentId = parsed.agent as AgentId
              const agent = AGENT_MAP[agentId]
              if (agent) {
                agentStartTimes.current[agentId] = Date.now()
                setPipelineState(prev => ({
                  ...prev,
                  activeAgent: agentId,
                  currentLog: `$ ${agent.label} agent — ${parsed.message || agent.description}`,
                  agentMessages: { ...prev.agentMessages, [agentId]: parsed.message || 'Starting...' },
                }))
              }
            } else if (eventType === 'agent_complete') {
              const agentId = parsed.agent as AgentId
              const agent = AGENT_MAP[agentId]
              if (agent) {
                const startTime = agentStartTimes.current[agentId] || Date.now()
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
                completedCountRef.current++
                setPipelineState(prev => ({
                  ...prev,
                  completedAgents: [...AGENT_IDS.slice(0, completedCountRef.current)],
                  agentTimers: { ...prev.agentTimers, [agentId]: elapsed },
                  agentMessages: { ...prev.agentMessages, [agentId]: parsed.message || '' },
                  currentLog: `${agent.label} complete in ${elapsed}s — ${parsed.message || ''}`,
                  activeAgent: completedCountRef.current < AGENT_IDS.length ? AGENT_IDS[completedCountRef.current] : null,
                }))
              }
            } else if (eventType === 'complete') {
              updateState({ activeAgent: null, currentLog: 'Pipeline complete — report generated' })
              setReport(parsed.report)
              setPhase('complete')
              phaseRef.current = 'complete'
              return
            }
          } catch {
            // skip unparseable events
          }
        }
      }

      // If we exit the loop without getting a 'complete' event, check for fallback
      if (phaseRef.current === 'running') {
        throw new Error('Stream ended without completing')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'

      // Fallback: try non-streaming POST if SSE failed (e.g. CORS issue in local dev)
      if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('CORS')) {
        try {
          updateState({ currentLog: 'Falling back to non-streaming mode...' })
          const res = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, stream: false }),
          })

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}))
            throw new Error(errBody.detail || `HTTP ${res.status}`)
          }

          const data = await res.json()
          if (data.report) {
            const timings = data.report.pipeline_log || []
            for (let i = 0; i < AGENT_IDS.length; i++) {
              const agentId = AGENT_IDS[i]
              const agent = AGENT_MAP[agentId]
              setPipelineState(prev => ({
                ...prev,
                activeAgent: agentId,
                currentLog: `$ ${agent.label} agent — ${agent.description}`,
                agentMessages: { ...prev.agentMessages, [agentId]: timings[i]?.message || 'Processing...' },
              }))
              await delay(1200 + Math.random() * 1000)
              const elapsed = timings[i]?.duration?.toFixed(1) || '1.0'
              setPipelineState(prev => ({
                ...prev,
                completedAgents: [...AGENT_IDS.slice(0, i + 1)],
                agentTimers: { ...prev.agentTimers, [agentId]: elapsed },
                agentMessages: { ...prev.agentMessages, [agentId]: '' },
                currentLog: `${agent.label} complete in ${elapsed}s — ${timings[i]?.message || ''}`,
              }))
            }
            updateState({ activeAgent: null, currentLog: 'Pipeline complete — report generated' })
            setReport(data.report)
            setPhase('complete')
            phaseRef.current = 'complete'
            return
          }
          throw new Error('Invalid response from backend')
        } catch (fallbackErr) {
          const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error'
          setError(`Backend unavailable: ${fallbackMsg}. Please check that the backend is running and try again.`)
          updateState({ currentLog: 'Backend unavailable — check backend connection' })
          setPhase('idle')
          phaseRef.current = 'idle'
          return
        }
      }

      setError(`Backend unavailable: ${message}. Please check that the backend is running and try again.`)
      updateState({ currentLog: 'Backend unavailable — check backend connection' })
      setPhase('idle')
      phaseRef.current = 'idle'
    }
  }, [updateState, resetPipeline])

  const runBatchPipeline = useCallback(async (topics: string[]): Promise<{ topic: string; report: VerificationReport | null; status: string; error?: string }[]> => {
    try {
      const res = await fetch(`${RAILWAY_URL}/api/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      return data.results || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return topics.map(t => ({ topic: t, report: null, status: 'error', error: message }))
    }
  }, [])

  return {
    phase,
    pipelineState,
    report,
    error,
    runLivePipeline,
    runBatchPipeline,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
