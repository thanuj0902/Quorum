import { useState, useCallback, useRef } from 'react'
import { AGENT_IDS, AGENT_MAP } from '../data/agents'
import type { PipelineState, PipelinePhase, VerificationReport, PipelineLogEntry } from '../types'

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

  const updateState = useCallback((updates: Partial<PipelineState>) => {
    setPipelineState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetPipeline = useCallback(() => {
    setError(null)
    setReport(null)
    completedCountRef.current = 0
    setPipelineState({
      activeAgent: null,
      completedAgents: [],
      agentMessages: {},
      agentTimers: {},
      currentLog: 'Initializing multi-agent pipeline...',
    })
  }, [])

  const activateAgentsSequentially = useCallback((logEntries: PipelineLogEntry[]) => {
    const index = completedCountRef.current
    if (index >= AGENT_IDS.length) return

    const agentId = AGENT_IDS[index]
    const agent = AGENT_MAP[agentId]
    const logEntry = logEntries[index]

    setPipelineState(prev => ({
      ...prev,
      activeAgent: agentId,
      currentLog: `$ ${agent.label} agent — ${agent.description}`,
      agentMessages: { ...prev.agentMessages, [agentId]: logEntry?.message || 'Processing...' },
    }))

    setTimeout(() => {
      const elapsed = logEntry?.duration?.toFixed(1) || '0'
      completedCountRef.current = index + 1
      setPipelineState(prev => ({
        ...prev,
        completedAgents: [...AGENT_IDS.slice(0, index + 1)],
        agentTimers: { ...prev.agentTimers, [agentId]: elapsed },
        agentMessages: { ...prev.agentMessages, [agentId]: '' },
        currentLog: `${agent.label} complete in ${elapsed}s — ${logEntry?.message || ''}`,
        activeAgent: index + 1 < AGENT_IDS.length ? AGENT_IDS[index + 1] : null,
      }))
    }, 800)
  }, [])

  const runLivePipeline = useCallback(async (topic: string): Promise<void> => {
    resetPipeline()
    setPhase('running')
    updateState({ currentLog: 'Connecting to multi-agent backend...' })

    try {
      // Try SSE streaming first
      const streamRes = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, stream: true }),
      })

      if (streamRes.ok && streamRes.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = streamRes.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            let eventType = ''
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim()
              } else if (line.startsWith('data: ')) {
                const data = line.slice(6)
                try {
                  const parsed = JSON.parse(data)

                  if (eventType === 'agent_complete') {
                    activateAgentsSequentially([parsed])
                  } else if (eventType === 'complete') {
                    updateState({ activeAgent: null, currentLog: 'Pipeline complete — report generated' })
                    setReport(parsed.report)
                    setPhase('complete')
                    return
                  }
                } catch { /* skip malformed */ }
              }
            }
          }
        }
      }

      // Fallback: non-streaming POST
      if (streamRes.ok && !streamRes.headers.get('content-type')?.includes('text/event-stream')) {
        const data = await streamRes.json()
        if (data.report) {
          // Animate through the agents using real timings
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
          return
        }
      }

      throw new Error('Invalid response from backend')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(`Backend unavailable: ${message}. Please check that the backend is running and try again.`)
      updateState({ currentLog: 'Backend unavailable — check backend connection' })
      setPhase('idle')
    }
  }, [updateState, resetPipeline, activateAgentsSequentially])

  const runBatchPipeline = useCallback(async (topics: string[]): Promise<{ topic: string; report: VerificationReport | null; status: string; error?: string }[]> => {
    try {
      const res = await fetch('/api/batch', {
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
