import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, FileDown, Share2, History, Mic, MicOff, Layers, Sun, Moon } from 'lucide-react'
import Logo from '../ui/Logo'
import PipelineVisualizer from './PipelineVisualizer'
import ConfidenceReport from '../Report/ConfidenceReport'
import SourceTrustLedger from '../Report/SourceTrustLedger'
import { exportReportAsPDF } from '../../utils/pdf'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { useTheme } from '../../hooks/useTheme'
import type { PipelinePhase, PipelineState, VerificationReport } from '../../types'

interface PipelineViewProps {
  phase: PipelinePhase
  pipelineState: PipelineState
  report: VerificationReport | null
  error: string | null
  onBack: () => void
  onAnalyze: (topic: string) => void
  onSaveReport: () => string | undefined
  onViewHistory: () => void
  onOpenBatch?: () => void
}

export default function PipelineView({ phase, pipelineState, report, error, onBack, onAnalyze, onSaveReport, onViewHistory, onOpenBatch }: PipelineViewProps) {
  const [topic, setTopic] = useState<string>('Impact of artificial intelligence on healthcare diagnostics')
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening, resetTranscript } = useVoiceInput()
  const { theme, toggle } = useTheme()

  const handleSubmit = useCallback(() => {
    const trimmed = topic.trim()
    if (!trimmed || phase === 'running') return
    onAnalyze(trimmed)
  }, [topic, phase, onAnalyze])

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleVoiceConfirm = useCallback(() => {
    if (transcript) {
      setTopic(transcript)
      resetTranscript()
      stopListening()
    }
  }, [transcript, resetTranscript, stopListening])

  return (
    <>
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -25, 20, 0], y: [0, 20, -15, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)' }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`pipeline-particle-${i}`}
            animate={{ y: [0, -15 - i * 3, 0], x: [0, (i % 2 === 0 ? 8 : -8), 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 6 + i * 1.5, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-accent/20"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              top: `${15 + i * 12}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      <nav className="sticky top-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50" role="navigation" aria-label="Pipeline navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onBack} />

          <div className="flex items-center gap-3" aria-live="polite">
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-secondary transition-all duration-300 hover:border-accent/30 hover:text-text"
              style={{ background: 'var(--color-surface)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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

      {phase === 'complete' && report && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50"
          style={{ background: '#111114' }}
        >
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
            <button
              onClick={onSaveReport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:border-accent/30"
              style={{ background: '#18181D', borderColor: '#222230', color: '#A78BFA' }}
            >
              <Save className="w-3.5 h-3.5" />
              Save to History
            </button>
            <button
              onClick={() => exportReportAsPDF(report)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:border-accent/30"
              style={{ background: '#18181D', borderColor: '#222230', color: '#34D399' }}
            >
              <FileDown className="w-3.5 h-3.5" />
              Export PDF
            </button>
            <button
              onClick={() => {
                const id = onSaveReport()
                if (id) {
                  navigator.clipboard.writeText(`${window.location.origin}#${id}`).catch(() => {})
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:border-accent/30"
              style={{ background: '#18181D', borderColor: '#222230', color: '#FBBF24' }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Link
            </button>
            <button
              onClick={onViewHistory}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:border-accent/30"
              style={{ background: '#18181D', borderColor: '#222230', color: '#A78BFA' }}
            >
              <History className="w-3.5 h-3.5" />
              View History
            </button>
            {onOpenBatch && (
              <button
                onClick={onOpenBatch}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:border-accent/30"
                style={{ background: '#18181D', borderColor: '#222230', color: '#FB923C' }}
              >
                <Layers className="w-3.5 h-3.5" />
                Batch Verify
              </button>
            )}
          </div>
        </motion.div>
      )}

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
              value={isListening && transcript ? transcript : topic}
              onChange={(e) => { if (!isListening) setTopic(e.target.value) }}
              placeholder={isListening ? 'Listening...' : 'Enter a research topic or claim...'}
              maxLength={500}
              className="w-full bg-surface border border-border rounded-2xl px-5 py-4 pr-12 text-sm font-body placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden="true" />
          </div>
          {voiceSupported && (
            <div className="flex items-center gap-2">
              {isListening && transcript && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleVoiceConfirm}
                  className="px-3 py-2 bg-green/10 border border-green/20 text-green text-xs font-medium rounded-xl hover:bg-green/20 transition-colors"
                >
                  Use this
                </motion.button>
              )}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceToggle}
                className={`p-3 rounded-xl border transition-all duration-300 ${isListening ? 'bg-red/10 border-red/30 text-red shadow-lg shadow-red/10' : 'bg-surface border-border text-text-secondary hover:text-accent hover:border-accent/30'}`}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
            </div>
          )}
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
