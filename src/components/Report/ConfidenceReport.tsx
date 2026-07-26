import { memo } from 'react'
import { motion } from 'framer-motion'
import { confidenceClasses } from '../../utils/colors'
import AnimatedNumber from '../ui/AnimatedNumber'
import ClaimCard from './ClaimCard'
import { TrendingUp, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'
import type { VerificationReport } from '../../types'

interface ConfidenceReportProps {
  report: VerificationReport
}

function ConfidenceReport({ report }: ConfidenceReportProps) {
  if (!report) return null

  const overallScore = Math.round((report.overall_confidence || 0) * 100)
  const claims = report.claims || []
  const hallucinations = report.hallucinations || []
  const { gradient: scoreColor } = confidenceClasses(overallScore)

  const verified = claims.filter(c => c.verification_status === 'verified').length
  const partial = claims.filter(c => c.verification_status === 'partially_verified').length
  const unverified = claims.filter(c => c.verification_status === 'unverified' || c.verification_status === 'contradicted').length
  const flagged = hallucinations.filter(h => h.is_hallucination).length

  return (
    <div className="space-y-8">
      {/* Query echo — always shows what topic this report is about */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-3 rounded-2xl border"
        style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.15)' }}
      >
        <span className="text-xs font-mono font-semibold text-accent/70 uppercase tracking-wider shrink-0">Report for:</span>
        <span className="text-sm font-medium text-text truncate">{report.topic}</span>
      </motion.div>

      {/* Live search notice */}
      <div className="text-[11px] text-text/40 text-center -mt-4">
        Results are generated from live web search — scores may vary between runs as sources and evidence change.
      </div>

      {/* Overall confidence — hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative border rounded-3xl p-8 md:p-10 overflow-hidden"
        style={{ background: '#111114' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.04), transparent 50%, rgba(52,211,153,0.02))' }} />

        {/* Floating accent orbs inside hero card */}
        <motion.div
          animate={{ x: [0, 15, -10, 0], y: [0, -12, 8, 0], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 right-8 w-32 h-32 rounded-full blur-2xl bg-accent/10"
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, -10, 12, 0], y: [0, 10, -8, 0], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 15, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-4 left-8 w-24 h-24 rounded-full blur-2xl bg-green/8"
          aria-hidden="true"
        />
        {/* Floating ring */}
        <motion.div
          animate={{ rotate: [0, 360], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-accent/10"
          aria-hidden="true"
        />
        {/* Floating dots */}
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-accent/30"
          aria-hidden="true"
        />
        <motion.div
          animate={{ y: [0, -4, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 right-16 w-1 h-1 rounded-full bg-green/30"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em] mb-2">Overall Confidence</p>
              <div className="flex items-end gap-4">
                <div className={`font-display text-6xl md:text-7xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>
                  <AnimatedNumber value={overallScore} />%
                </div>
                {overallScore >= 80 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mb-2"
                    style={{ background: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.2)', color: '#34D399' }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    High reliability
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.12)' }}>
                <CheckCircle2 className="w-4 h-4 text-green" />
                <div>
                  <div className="font-mono text-lg font-bold text-green">{verified}</div>
                  <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.12)' }}>
                <AlertTriangle className="w-4 h-4 text-yellow" />
                <div>
                  <div className="font-mono text-lg font-bold text-yellow">{partial}</div>
                  <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Partial</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.12)' }}>
                <XCircle className="w-4 h-4 text-red" />
                <div>
                  <div className="font-mono text-lg font-bold text-red">{unverified + flagged}</div>
                  <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Flagged</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden mb-6" style={{ background: '#1F1F26' }} role="progressbar" aria-valuenow={overallScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Overall confidence: ${overallScore}%`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
              style={{ boxShadow: `0 0 20px ${overallScore >= 70 ? 'rgba(52,211,153,0.3)' : overallScore >= 40 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}` }}
            />
          </div>

          <p className="text-text-secondary text-sm leading-relaxed">{report.summary}</p>
        </div>
      </motion.div>

      {/* Pipeline performance */}
      {report.pipeline_log && report.pipeline_log.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border rounded-2xl p-5 overflow-hidden"
          style={{ background: '#111114', borderColor: '#222230' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <h3 className="font-display text-sm font-semibold">Pipeline Performance</h3>
            <span className="ml-auto text-[11px] text-text-secondary/40 font-mono">
              Total: {report.pipeline_log.reduce((s, l) => s + (l.duration || 0), 0).toFixed(1)}s
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {report.pipeline_log.map((log, i) => (
              <div key={i} className="rounded-xl p-3 border" style={{ background: '#18181D', borderColor: '#222230' }}>
                <div className="text-[11px] text-text-secondary/60 uppercase tracking-wider mb-1">{log.agent}</div>
                <div className="font-mono text-sm font-bold text-accent">{log.duration}s</div>
                <div className="text-[10px] text-text-secondary/40 mt-1 truncate">{log.message}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Claims list */}
      {claims.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <TrendingUp className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold">Claim-Level Report</h3>
            </div>
            <span className="text-xs text-text-secondary/50 font-mono px-3 py-1.5 rounded-lg" style={{ background: '#18181D' }}>{claims.length} claims</span>
          </div>
          <div className="space-y-3" role="list" aria-label="Verified claims">
            {claims.map((claim, i) => {
              const flag = hallucinations.find(h => h.claim === claim.claim)
              return (
                <div key={claim.claim || i} role="listitem">
                  <ClaimCard claim={claim} index={i} hallucinationFlag={flag} />
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default memo(ConfidenceReport)
