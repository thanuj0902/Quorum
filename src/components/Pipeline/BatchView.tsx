import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Zap, CheckCircle2, AlertTriangle, XCircle, Mic, MicOff, Sun, Moon } from 'lucide-react'
import Logo from '../ui/Logo'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { useTheme } from '../../hooks/useTheme'
import type { VerificationReport } from '../../types'

interface BatchViewProps {
  onBack: () => void
  onSaveReport: (report: VerificationReport) => string
  onRunBatch: (topics: string[]) => Promise<{ topic: string; report: VerificationReport | null; status: string; error?: string }[]>
}

type BatchClaimStatus = 'pending' | 'running' | 'complete' | 'error'

interface BatchClaim {
  topic: string
  status: BatchClaimStatus
  report: VerificationReport | null
  error?: string
}

export default function BatchView({ onBack, onSaveReport: _onSaveReport, onRunBatch }: BatchViewProps) {
  const [inputs, setInputs] = useState<BatchClaim[]>([
    { topic: '', status: 'pending', report: null },
    { topic: '', status: 'pending', report: null },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening, resetTranscript } = useVoiceInput()
  const [voiceTargetIndex, setVoiceTargetIndex] = useState<number | null>(null)
  const { theme, toggle } = useTheme()

  const canAdd = inputs.length < 5
  const canVerify = inputs.some((c) => c.topic.trim()) && !isRunning

  const updateTopic = useCallback((index: number, value: string) => {
    setInputs((prev) => prev.map((c, i) => (i === index ? { ...c, topic: value } : c)))
  }, [])

  const addInput = useCallback(() => {
    if (!canAdd) return
    setInputs((prev) => [...prev, { topic: '', status: 'pending', report: null }])
  }, [canAdd])

  const removeInput = useCallback((index: number) => {
    if (inputs.length <= 2) return
    setInputs((prev) => prev.filter((_, i) => i !== index))
  }, [inputs.length])

  const handleVoiceToggle = useCallback((index: number) => {
    if (isListening && voiceTargetIndex === index) {
      stopListening()
      setVoiceTargetIndex(null)
    } else {
      if (isListening) stopListening()
      setVoiceTargetIndex(index)
      startListening()
    }
  }, [isListening, voiceTargetIndex, startListening, stopListening])

  const handleVoiceConfirm = useCallback(() => {
    if (transcript && voiceTargetIndex !== null) {
      updateTopic(voiceTargetIndex, transcript)
      resetTranscript()
      stopListening()
      setVoiceTargetIndex(null)
    }
  }, [transcript, voiceTargetIndex, updateTopic, resetTranscript, stopListening])

  const handleVerify = useCallback(async () => {
    setIsRunning(true)
    const filled = inputs.map((c, i) => ({ ...c, index: i })).filter((c) => c.topic.trim())

    // Mark all as running
    setInputs((prev) =>
      prev.map((c, i) => {
        const filledIndex = filled.findIndex(f => f.index === i)
        return filledIndex >= 0 ? { ...c, status: 'running' as const } : c
      })
    )

    setActiveIndex(0)

    const topics = filled.map(c => c.topic.trim())
    const results = await onRunBatch(topics)

    for (let i = 0; i < filled.length; i++) {
      const result = results[i]
      const claimIndex = filled[i].index
      if (result) {
        setInputs((prev) =>
          prev.map((c, idx) =>
            idx === claimIndex
              ? { ...c, status: result.status === 'success' ? 'complete' : 'error', report: result.report, error: result.error }
              : c
          )
        )
      }
    }

    setActiveIndex(null)
    setIsRunning(false)
  }, [inputs, onRunBatch])

  const getStatusCounts = (report: VerificationReport) => {
    const verified = report.claims.filter((c) => c.verification_status === 'verified').length
    const partial = report.claims.filter((c) => c.verification_status === 'partially_verified').length
    const flagged = report.claims.filter(
      (c) => c.verification_status === 'unverified' || c.verification_status === 'contradicted'
    ).length
    return { verified, partial, flagged }
  }

  const getConfColor = (conf: number) => {
    if (conf >= 0.7) return 'text-green'
    if (conf >= 0.4) return 'text-yellow'
    return 'text-red'
  }

  const getConfBg = (conf: number) => {
    if (conf >= 0.7) return 'bg-green/10 text-green'
    if (conf >= 0.4) return 'bg-yellow/10 text-yellow'
    return 'bg-red/10 text-red'
  }

  const hasResults = inputs.some((c) => c.status === 'complete' && c.report)

  return (
    <>
      <nav className="sticky top-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onBack} />
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-secondary transition-all duration-300 hover:border-accent/30 hover:text-text"
              style={{ background: 'var(--color-surface)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Batch Verify</h1>
          <p className="text-text-secondary text-sm mt-1">Compare multiple claims side by side</p>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {inputs.map((claim, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={isListening && voiceTargetIndex === i ? (transcript || claim.topic) : claim.topic}
                    onChange={(e) => updateTopic(i, e.target.value)}
                    placeholder={isListening && voiceTargetIndex === i ? 'Listening...' : `Claim or topic ${i + 1}...`}
                    disabled={isRunning}
                    maxLength={500}
                    className="w-full bg-surface border border-border rounded-2xl px-5 py-4 pr-12 text-sm font-body placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-300 disabled:opacity-50"
                  />
                  {claim.status === 'running' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="relative flex h-3 w-3"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
                      </motion.span>
                    </div>
                  )}
                  {claim.status === 'complete' && claim.report && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${getConfBg(claim.report.overall_confidence)}`}>
                        {Math.round(claim.report.overall_confidence * 100)}%
                      </span>
                    </div>
                  )}
                  {claim.status === 'error' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red text-[10px] font-mono">
                      Error
                    </div>
                  )}
                </div>
                {voiceSupported && !isRunning && (
                  <div className="flex items-center gap-1.5">
                    {isListening && voiceTargetIndex === i && transcript && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleVoiceConfirm}
                        className="px-2 py-1.5 bg-green/10 border border-green/20 text-green text-[10px] font-medium rounded-lg hover:bg-green/20 transition-colors"
                      >
                        Use
                      </motion.button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleVoiceToggle(i)}
                      className={`p-1.5 rounded-lg border transition-all ${isListening && voiceTargetIndex === i ? 'bg-red/10 border-red/30 text-red' : 'bg-surface border-border text-text-secondary hover:text-accent'}`}
                      aria-label={isListening && voiceTargetIndex === i ? 'Stop voice input' : 'Start voice input'}
                    >
                      {isListening && voiceTargetIndex === i ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    </button>
                  </div>
                )}
                {!isRunning && inputs.length > 2 && (
                  <button
                    onClick={() => removeInput(i)}
                    className="p-2 text-text-secondary hover:text-red transition-colors rounded-xl hover:bg-surface-2"
                    aria-label={`Remove claim ${i + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {canAdd && !isRunning && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={addInput}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors py-2 px-1"
            >
              <Plus className="w-4 h-4" />
              Add claim
            </motion.button>
          )}
        </div>

        {!isRunning && (
          <motion.button
            whileHover={canVerify ? { scale: 1.02 } : {}}
            whileTap={canVerify ? { scale: 0.98 } : {}}
            onClick={handleVerify}
            disabled={!canVerify}
            className="relative px-7 py-4 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Verify All
            </span>
          </motion.button>
        )}

        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-sm text-accent"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
            />
            Verifying{activeIndex !== null ? ` claim ${activeIndex + 1}` : ''}...
          </motion.div>
        )}

        {hasResults && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-display font-semibold text-text">Results</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(inputs.filter((c) => c.report || c.status === 'error').length, 3)}, 1fr)` }}>
              {inputs
                .filter((c) => c.status === 'complete' || c.status === 'error')
                .map((c, i) => {
                  if (c.status === 'error') {
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface border border-red/20 rounded-2xl p-5"
                      >
                        <h3 className="text-sm font-semibold text-text truncate mb-2" title={c.topic}>{c.topic}</h3>
                        <p className="text-xs text-red">{c.error || 'Verification failed'}</p>
                      </motion.div>
                    )
                  }
                  const report = c.report!
                  const conf = report.overall_confidence
                  const counts = getStatusCounts(report)
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-surface border border-border rounded-2xl p-5 space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-text truncate" title={c.topic}>
                          {c.topic}
                        </h3>
                        <div className={`text-2xl font-bold font-mono mt-2 ${getConfColor(conf)}`}>
                          {Math.round(conf * 100)}%
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {report.claims.slice(0, 3).map((claim, ci) => (
                          <p key={ci} className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                            &bull; {claim.claim}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {counts.verified > 0 && (
                          <span className="flex items-center gap-1 text-green">
                            <CheckCircle2 className="w-3 h-3" />
                            {counts.verified}
                          </span>
                        )}
                        {counts.partial > 0 && (
                          <span className="flex items-center gap-1 text-yellow">
                            <AlertTriangle className="w-3 h-3" />
                            {counts.partial}
                          </span>
                        )}
                        {counts.flagged > 0 && (
                          <span className="flex items-center gap-1 text-red">
                            <XCircle className="w-3 h-3" />
                            {counts.flagged}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </main>
    </>
  )
}
