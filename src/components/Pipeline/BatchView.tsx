import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Zap, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import Logo from '../ui/Logo'
import { demoReport } from '../../data/demoData'
import type { VerificationReport } from '../../types'

interface BatchViewProps {
  onBack: () => void
  onSaveReport: (report: VerificationReport) => string
}

type BatchClaimStatus = 'pending' | 'running' | 'complete'

interface BatchClaim {
  topic: string
  status: BatchClaimStatus
  report: VerificationReport | null
}

function createMockReport(topic: string): VerificationReport {
  const base = { ...demoReport, topic }
  base.overall_confidence = 0.5 + Math.random() * 0.45
  base.claims = base.claims.slice(0, 3).map((c, i) => ({
    ...c,
    confidence: Math.min(1, Math.max(0.3, c.confidence + (Math.random() - 0.5) * 0.3)),
    verification_status: (['verified', 'partially_verified', 'unverified', 'contradicted'] as const)[i % 3],
  }))
  return base
}

export default function BatchView({ onBack, onSaveReport: _onSaveReport }: BatchViewProps) {
  const [inputs, setInputs] = useState<BatchClaim[]>([
    { topic: '', status: 'pending', report: null },
    { topic: '', status: 'pending', report: null },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

  const handleVerify = useCallback(async () => {
    setIsRunning(true)
    const filled = inputs.map((c, i) => ({ ...c, index: i })).filter((c) => c.topic.trim())

    for (const claim of filled) {
      setActiveIndex(claim.index)
      setInputs((prev) =>
        prev.map((c, i) => (i === claim.index ? { ...c, status: 'running' as const } : c))
      )
      await new Promise((r) => setTimeout(r, 1500))
      const report = createMockReport(claim.topic.trim())
      setInputs((prev) =>
        prev.map((c, i) =>
          i === claim.index ? { ...c, status: 'complete' as const, report } : c
        )
      )
    }

    setActiveIndex(null)
    setIsRunning(false)
  }, [inputs])

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
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
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
                    value={claim.topic}
                    onChange={(e) => updateTopic(i, e.target.value)}
                    placeholder={`Claim or topic ${i + 1}...`}
                    disabled={isRunning}
                    maxLength={500}
                    className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-sm font-body placeholder:text-text-secondary/30 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-300 disabled:opacity-50"
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
                </div>
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
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(inputs.filter((c) => c.report).length, 3)}, 1fr)` }}>
              {inputs
                .filter((c) => c.status === 'complete' && c.report)
                .map((c, i) => {
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
