import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

import { confidenceClasses } from '../../utils/colors'

function statusIcon(status) {
  switch (status) {
    case 'verified': return <CheckCircle2 className="w-4 h-4 text-green" aria-hidden="true" />
    case 'partially_verified': return <AlertTriangle className="w-4 h-4 text-yellow" aria-hidden="true" />
    case 'unverified': return <XCircle className="w-4 h-4 text-text-secondary" aria-hidden="true" />
    case 'contradicted': return <XCircle className="w-4 h-4 text-red" aria-hidden="true" />
    default: return null
  }
}

function ClaimCard({ claim, index }) {
  const [expanded, setExpanded] = useState(false)
  if (!claim) return null

  const conf = confidenceClasses(Math.round((claim.confidence || 0) * 100))
  const statusText = claim.verification_status?.replace(/_/g, ' ') || 'unknown'
  const supportingCount = claim.supporting_sources?.length || 0
  const contradictingCount = claim.contradicting_sources?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-border-hover transition-all duration-300"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`Claim: ${claim.claim || 'Unknown'}. Confidence: ${Math.round((claim.confidence || 0) * 100)}%. Status: ${statusText}. ${expanded ? 'Collapse' : 'Expand'} for details.`}
        className="w-full text-left p-5 flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed mb-3">{claim.claim}</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${conf.bg} ${conf.text} border ${conf.border}`}>
              {Math.round((claim.confidence || 0) * 100)}%
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
              {statusIcon(claim.verification_status)}
              {statusText}
            </span>
            {supportingCount > 0 && (
              <span className="text-[11px] text-green font-mono bg-green/5 px-1.5 py-0.5 rounded">{supportingCount} supporting</span>
            )}
            {contradictingCount > 0 && (
              <span className="text-[11px] text-red font-mono bg-red/5 px-1.5 py-0.5 rounded">{contradictingCount} contradicting</span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-secondary/60 shrink-0 mt-1"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t border-border overflow-hidden"
        >
          <div className="px-5 py-5 space-y-4">
            {claim.supporting_sources?.length > 0 && (
              <div>
                <p className="text-[11px] text-green font-semibold mb-2.5 uppercase tracking-wider">Supporting Sources</p>
                <ul className="space-y-2" role="list">
                  {claim.supporting_sources.map((src, i) => (
                    <li key={src || i} className="flex items-center gap-2.5 text-sm text-text-secondary bg-surface-2/50 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0" aria-hidden="true" />
                      <span className="truncate">{src}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {claim.contradicting_sources?.length > 0 && (
              <div>
                <p className="text-[11px] text-red font-semibold mb-2.5 uppercase tracking-wider">Contradicting Sources</p>
                <ul className="space-y-2" role="list">
                  {claim.contradicting_sources.map((src, i) => (
                    <li key={src || i} className="flex items-center gap-2.5 text-sm text-text-secondary bg-surface-2/50 rounded-lg px-3 py-2">
                      <XCircle className="w-3.5 h-3.5 text-red shrink-0" aria-hidden="true" />
                      <span className="truncate">{src}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-1">
              <p className="text-xs text-text-secondary/60">
                <span className="font-semibold text-text-secondary/80">Source:</span> {claim.source}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default memo(ClaimCard)
