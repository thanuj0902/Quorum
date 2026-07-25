import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from '../ui/Logo'
import PipelineVisualizer from './PipelineVisualizer'
import ConfidenceReport from '../Report/ConfidenceReport'
import SourceTrustLedger from '../Report/SourceTrustLedger'
import type { PipelinePhase, PipelineState, VerificationReport } from '../../types'

interface PipelineViewProps {
  phase: PipelinePhase
  pipelineState: PipelineState
  report: VerificationReport | null
  error: string | null
  onBack: () => void
  onAnalyze: (topic: string) => void
}

export default function PipelineView({ phase, pipelineState, report, error, onBack, onAnalyze }: PipelineViewProps) {
  const [topic, setTopic] = useState<string>('Impact of artificial intelligence on healthcare diagnostics')

  const handleSubmit = useCallback(() => {
    const trimmed = topic.trim()
    if (!trimmed || phase === 'running') return
    onAnalyze(trimmed)
  }, [topic, phase, onAnalyze])

  return (
    <>
      <nav className="sticky top-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50" role="navigation" aria-label="Pipeline navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onBack} />

          <div className="flex items-center gap-3" aria-live="polite">
            {phase === 'running' && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-xs text-accent font-mono flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                Pipeline running
              </motion.span>
            )}
            {phase === 'complete' && (
              <span className="text-xs text-green font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green" aria-hidden="true" />
                Complete
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-dim border border-red/20 rounded-2xl text-sm text-red flex items-center gap-3"
              role="alert"
            >
              <div className="w-5 h-5 rounded-full bg-red/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <span className="text-red text-xs font-bold">!</span>
              </div>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex gap-3">
          <label htmlFor="topic-input" className="sr-only">Research topic</label>
          <div className="flex-1 relative group">
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a research topic or claim..."
              maxLength={500}
              className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-sm font-body placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden="true" />
          </div>
          <motion.button
            type="submit"
            disabled={phase === 'running' || !topic.trim()}
            whileHover={phase !== 'running' && topic.trim() ? { scale: 1.02 } : {}}
            whileTap={phase !== 'running' && topic.trim() ? { scale: 0.98 } : {}}
            className="relative px-7 py-4 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative">{phase === 'running' ? 'Analyzing...' : 'Analyze'}</span>
          </motion.button>
        </form>

        {/* Pipeline Visualizer */}
        <PipelineVisualizer pipelineState={pipelineState} />

        {/* Results */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <ConfidenceReport report={report} />
              <SourceTrustLedger report={report} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
