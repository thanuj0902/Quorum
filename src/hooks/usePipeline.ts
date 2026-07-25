import { useState, useCallback } from 'react'
import { AGENT_IDS, AGENT_MAP, PIPELINE_TIMING } from '../data/agents'
import { demoReport, demoPipelineMessages } from '../data/demoData'
import type { PipelineState, PipelinePhase, VerificationReport } from '../types'

interface UsePipelineReturn {
  phase: PipelinePhase
  pipelineState: PipelineState
  report: VerificationReport | null
  error: string | null
  runDemoPipeline: () => Promise<void>
  runLivePipeline: (topic: string) => Promise<void>
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

  const updateState = useCallback((updates: Partial<PipelineState>) => {
    setPipelineState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetPipeline = useCallback(() => {
    setError(null)
    setReport(null)
    setPipelineState({
      activeAgent: null,
      completedAgents: [],
      agentMessages: {},
      agentTimers: {},
      currentLog: 'Initializing multi-agent pipeline...',
    })
  }, [])

  const runDemoPipeline = useCallback(async (): Promise<void> => {
    resetPipeline()
    setPhase('running')

    await delay(PIPELINE_TIMING.INIT_DELAY)

    for (let i = 0; i < AGENT_IDS.length; i++) {
      const agentId = AGENT_IDS[i]
      const agent = AGENT_MAP[agentId]
      const messages = demoPipelineMessages[agentId]
      const startTime = Date.now()

      updateState({
        activeAgent: agentId,
        currentLog: `$ ${agent.label} agent — ${agent.description}`,
      })

      await delay(300)

      for (let j = 0; j < messages.length; j++) {
        await delay(PIPELINE_TIMING.AGENT_MESSAGE_MIN + Math.random() * (PIPELINE_TIMING.AGENT_MESSAGE_MAX - PIPELINE_TIMING.AGENT_MESSAGE_MIN))
        setPipelineState(prev => ({
          ...prev,
          agentMessages: { ...prev.agentMessages, [agentId]: messages[j] },
          currentLog: messages[j],
        }))
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      setPipelineState(prev => ({
        ...prev,
        completedAgents: [...AGENT_IDS.slice(0, i + 1)],
        agentTimers: { ...prev.agentTimers, [agentId]: elapsed },
        agentMessages: { ...prev.agentMessages, [agentId]: '' },
        currentLog: `${agent.label} complete in ${elapsed}s`,
      }))

      await delay(PIPELINE_TIMING.AGENT_COMPLETE_DELAY)
    }

    updateState({ activeAgent: null, currentLog: 'Pipeline complete — report generated' })
    setReport(demoReport)
    setPhase('complete')
  }, [updateState, resetPipeline])

  const runLivePipeline = useCallback(async (topic: string): Promise<void> => {
    resetPipeline()
    setPhase('running')
    updateState({ currentLog: 'Connecting to multi-agent backend...' })

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const timings = data.report?.pipeline_log || []

      for (let i = 0; i < AGENT_IDS.length; i++) {
        const agentId = AGENT_IDS[i]
        const agent = AGENT_MAP[agentId]
        const startTime = Date.now()

        updateState({
          activeAgent: agentId,
          currentLog: `Processing with ${agent.label}...`,
        })

        await delay(PIPELINE_TIMING.LIVE_AGENT_MIN + Math.random() * (PIPELINE_TIMING.LIVE_AGENT_MAX - PIPELINE_TIMING.LIVE_AGENT_MIN))

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        setPipelineState(prev => ({
          ...prev,
          completedAgents: [...AGENT_IDS.slice(0, i + 1)],
          agentTimers: { ...prev.agentTimers, [agentId]: timings[i]?.duration || elapsed },
          currentLog: `${agent.label} complete in ${timings[i]?.duration || elapsed}s`,
        }))
      }

      updateState({ activeAgent: null, currentLog: 'Pipeline complete — report generated' })
      setReport(data.report)
      setPhase('complete')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(`Backend unavailable: ${message}. Falling back to demo.`)
      updateState({ currentLog: 'Backend unavailable — running demo mode' })
      await delay(PIPELINE_TIMING.FALLBACK_DELAY)
      await runDemoPipeline()
    }
  }, [updateState, resetPipeline, runDemoPipeline])

  return {
    phase,
    pipelineState,
    report,
    error,
    runDemoPipeline,
    runLivePipeline,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
