import React, { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldAlert, HelpCircle } from 'lucide-react'
import { confidenceClasses } from '../../utils/colors'
import type { Claim, HallucinationFlag } from '../../types'

interface ClaimCardProps {
  claim: Claim
  index: number
  hallucinationFlag?: HallucinationFlag
}

function statusIcon(status: Claim['verification_status']): React.ReactNode {
  switch (status) {
    case 'verified': return <CheckCircle2 className="w-4 h-4 text-green" aria-hidden="true" />
    case 'partially_verified': return <AlertTriangle className="w-4 h-4 text-yellow" aria-hidden="true" />
    case 'unverified': return <XCircle className="w-4 h-4 text-text-secondary" aria-hidden="true" />
    case 'contradicted': return <XCircle className="w-4 h-4 text-red" aria-hidden="true" />
  }
}

function statusLabel(status: Claim['verification_status']): { text: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'verified': return { text: 'Verified', color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' }
    case 'partially_verified': return { text: 'Partial', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' }
    case 'unverified': return { text: 'Unverified', color: '#7A7A95', bg: 'rgba(122,122,149,0.08)', border: 'rgba(122,122,149,0.2)' }
    case 'contradicted': return { text: 'Contradicted', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' }
  }
}

function ClaimCard({ claim, index, hallucinationFlag }: ClaimCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false)
  if (!claim) return null

  const conf = confidenceClasses(Math.round((claim.confidence || 0) * 100))
  const st = statusLabel(claim.verification_status)
  const supportingCount = claim.supporting_sources?.length || 0
  const contradictingCount = claim.contradicting_sources?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#111114', borderColor: expanded ? '#33334A' : '#222230' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`Claim: ${claim.claim || 'Unknown'}. Confidence: ${Math.round((claim.confidence || 0) * 100)}%. Status: ${st.text}. ${expanded ? 'Collapse' : 'Expand'} for details.`}
        className="w-full text-left p-5 flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed mb-3 font-medium">{claim.claim}</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Confidence badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
              style={{ background: conf.bg ? 'rgba(124,58,237,0.08)' : undefined, color: conf.gradient === 'from-green to-green/60' ? '#34D399' : conf.gradient === 'from-yellow to-yellow/60' ? '#FBBF24' : '#F87171', border: `1px solid ${conf.gradient?.includes('green') ? 'rgba(52,211,153,0.2)' : conf.gradient?.includes('yellow') ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}` }}
            >
              {Math.round((claim.confidence || 0) * 100)}%
            </span>
            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
            >
              {statusIcon(claim.verification_status)}
              {st.text}
            </span>
            {supportingCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ color: '#34D399', background: 'rgba(52,211,153,0.06)' }}>
                {supportingCount} supporting
              </span>
            )}
            {contradictingCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ color: '#F87171', background: 'rgba(248,113,113,0.06)' }}>
                {contradictingCount} contradicting
              </span>
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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t overflow-hidden"
            style={{ borderColor: '#222230' }}
          >
            <div className="px-5 py-5 space-y-5">
              {/* Reasoning */}
              {claim.reasoning && (
                <div className="p-4 rounded-xl border" style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.1)' }}>
                  <p className="text-[11px] text-accent/70 font-semibold mb-2 uppercase tracking-wider">Agent Reasoning</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{claim.reasoning}</p>
                </div>
              )}

              {/* Agent scores */}
              {claim.agent_scores && (
                <div className="flex gap-3">
                  {Object.entries(claim.agent_scores).map(([agent, score]) => (
                    <div key={agent} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: '#18181D', borderColor: '#222230' }}>
                      <span className="text-[10px] text-text-secondary/50 uppercase tracking-wider">{agent}</span>
                      <span className="font-mono text-xs font-bold text-accent">{Math.round(score * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Contradiction / Hallucination Flag */}
              {hallucinationFlag && hallucinationFlag.flag_type !== 'none' && (
                <div className={`p-4 rounded-xl border ${hallucinationFlag.flag_type === 'direct_contradiction' ? 'border-yellow/20' : 'border-red/20'}`}
                  style={{ background: hallucinationFlag.flag_type === 'direct_contradiction' ? 'rgba(251,191,36,0.04)' : 'rgba(248,113,113,0.04)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    {hallucinationFlag.flag_type === 'direct_contradiction' ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-yellow" />
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-red" />
                    )}
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${hallucinationFlag.flag_type === 'direct_contradiction' ? 'text-yellow' : 'text-red'}`}>
                      {hallucinationFlag.flag_type === 'direct_contradiction' ? 'Direct Contradiction' : 'Unsubstantiated Claim'}
                    </p>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${hallucinationFlag.severity === 'none' ? 'bg-surface-3 text-text-secondary' : hallucinationFlag.severity === 'low' ? 'bg-yellow/10 text-yellow' : 'bg-red/10 text-red'}`}>
                      {hallucinationFlag.severity}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{hallucinationFlag.reason}</p>
                  {hallucinationFlag.contradicting_sources && hallucinationFlag.contradicting_sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] text-text-secondary/50 mb-1">Contradicting sources:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hallucinationFlag.contradicting_sources.map((src, si) => (
                          <span key={si} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red/5 text-red/80 border border-red/10">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sources */}
              {claim.supporting_sources?.length > 0 && (
                <div>
                  <p className="text-[11px] text-green font-semibold mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    Supporting Sources
                  </p>
                  <ul className="space-y-1.5" role="list">
                    {claim.supporting_sources.map((src: string, i: number) => (
                      <li key={src || i} className="flex items-center gap-2.5 text-sm text-text-secondary px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.03)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green/60 shrink-0" aria-hidden="true" />
                        <span className="truncate">{src}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {claim.contradicting_sources?.length > 0 && (
                <div>
                  <p className="text-[11px] text-red font-semibold mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="w-3 h-3" aria-hidden="true" />
                    Contradicting Sources
                  </p>
                  <ul className="space-y-1.5" role="list">
                    {claim.contradicting_sources.map((src: string, i: number) => (
                      <li key={src || i} className="flex items-center gap-2.5 text-sm text-text-secondary px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.03)' }}>
                        <XCircle className="w-3.5 h-3.5 text-red/60 shrink-0" aria-hidden="true" />
                        <span className="truncate">{src}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Primary source */}
              <div className="flex items-center gap-2 pt-1 text-xs text-text-secondary/50">
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                <span>Source: </span>
                {claim.source_url ? (
                  <a
                    href={claim.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary/80 hover:text-accent underline underline-offset-2 decoration-text-secondary/30 hover:decoration-accent/50 transition-colors"
                  >
                    {claim.source}
                  </a>
                ) : (
                  <span className="text-text-secondary/80">{claim.source}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(ClaimCard)
