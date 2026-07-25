import { memo } from 'react'
import { motion } from 'framer-motion'
import { confidenceClasses } from '../../utils/colors'
import ClaimCard from './ClaimCard'

function ConfidenceReport({ report }) {
  if (!report) return null

  const overallScore = Math.round((report.overall_confidence || 0) * 100)
  const claims = report.claims || []

  const { gradient: scoreColor } = confidenceClasses(overallScore)

  return (
    <div className="space-y-8">
      {/* Overall confidence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-surface border border-border rounded-2xl p-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Overall Confidence</h3>
            <span className={`font-mono text-4xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>
              {overallScore}%
            </span>
          </div>

          <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden mb-6" role="progressbar" aria-valuenow={overallScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Overall confidence: ${overallScore}%`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
              style={{ boxShadow: `0 0 20px ${overallScore >= 70 ? 'rgba(52,211,153,0.3)' : overallScore >= 40 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}` }}
            />
          </div>

          <p className="text-text-secondary text-sm leading-relaxed">{report.summary}</p>
        </div>
      </motion.div>

      {/* Claims list */}
      {claims.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Claim-Level Report</h3>
            <span className="text-xs text-text-secondary/60 font-mono bg-surface-2 px-2.5 py-1 rounded-lg">{claims.length} claims</span>
          </div>
          <div className="space-y-3" role="list" aria-label="Verified claims">
            {claims.map((claim, i) => (
              <div key={claim.claim || i} role="listitem">
                <ClaimCard claim={claim} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ConfidenceReport)
