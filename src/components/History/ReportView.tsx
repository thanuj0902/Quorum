import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, ExternalLink, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'
import Logo from '../ui/Logo'
import { confidenceClasses } from '../../utils/colors'
import type { VerificationReport, Claim } from '../../types'

interface ReportViewProps {
  report: VerificationReport
  onBack: () => void
  onCopyLink: () => void
  linkCopied: boolean
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState<number>(0)

  useEffect(() => {
    let frameId: number
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return <span>{display}</span>
}

function statusIcon(status: Claim['verification_status']) {
  switch (status) {
    case 'verified': return <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
    case 'partially_verified': return <AlertTriangle className="w-4 h-4 text-yellow shrink-0" />
    case 'unverified': return <XCircle className="w-4 h-4 text-text-secondary shrink-0" />
    case 'contradicted': return <XCircle className="w-4 h-4 text-red shrink-0" />
  }
}

function statusLabel(status: Claim['verification_status']) {
  switch (status) {
    case 'verified': return { text: 'Verified', color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' }
    case 'partially_verified': return { text: 'Partial', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' }
    case 'unverified': return { text: 'Unverified', color: '#7A7A95', bg: 'rgba(122,122,149,0.08)', border: 'rgba(122,122,149,0.2)' }
    case 'contradicted': return { text: 'Contradicted', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' }
  }
}

function ReportView({ report, onBack, onCopyLink, linkCopied }: ReportViewProps) {
  const overallScore = Math.round((report.overall_confidence || 0) * 100)
  const claims = report.claims || []
  const { gradient: scoreColor } = confidenceClasses(overallScore)

  const verified = claims.filter(c => c.verification_status === 'verified').length
  const partial = claims.filter(c => c.verification_status === 'partially_verified').length
  const flagged = claims.filter(c => c.verification_status === 'unverified' || c.verification_status === 'contradicted').length

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-px h-5 bg-border/50" />
            <Logo onClick={onBack} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border"
            style={{
              background: linkCopied ? 'rgba(52,211,153,0.08)' : 'rgba(124,58,237,0.08)',
              borderColor: linkCopied ? 'rgba(52,211,153,0.2)' : 'rgba(124,58,237,0.2)',
              color: linkCopied ? '#34D399' : '#A78BFA',
            }}
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? 'Copied' : 'Copy Share Link'}
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Branding tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-text-secondary/40 uppercase tracking-[0.25em] font-medium">
            Multi-Agent Research & Verification
          </p>
        </motion.div>

        {/* Topic + Confidence hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative border rounded-3xl p-8 md:p-10 overflow-hidden"
          style={{ background: '#111114', borderColor: '#222230' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.04), transparent 50%, rgba(52,211,153,0.02))' }}
          />

          <div className="relative">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 leading-snug">
              {report.topic}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-[0.2em] mb-2">
                  Overall Confidence
                </p>
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
                    <div className="font-mono text-lg font-bold text-red">{flagged}</div>
                    <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider">Flagged</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden mb-6" style={{ background: '#1F1F26' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallScore}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
                style={{ boxShadow: `0 0 20px ${overallScore >= 70 ? 'rgba(52,211,153,0.3)' : overallScore >= 40 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}` }}
              />
            </div>

            <p className="text-text-secondary text-sm leading-relaxed">{report.summary}</p>

            {report.confidence_reasoning && (
              <p className="mt-3 text-xs text-text-secondary/50 italic leading-relaxed">
                {report.confidence_reasoning}
              </p>
            )}
          </div>
        </motion.div>

        {/* Claims */}
        {claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-lg font-semibold">Claim-Level Report</h2>
              <span className="ml-auto text-xs text-text-secondary/50 font-mono px-3 py-1.5 rounded-lg" style={{ background: '#18181D' }}>
                {claims.length} claims
              </span>
            </div>

            <div className="space-y-3" role="list" aria-label="Verified claims">
              {claims.map((claim, i) => {
                const st = statusLabel(claim.verification_status)
                const confPct = Math.round((claim.confidence || 0) * 100)

                return (
                  <motion.div
                    key={claim.claim || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                    className="border rounded-2xl p-5"
                    style={{ background: '#111114', borderColor: '#222230' }}
                    role="listitem"
                  >
                    <p className="text-sm font-medium leading-relaxed mb-3">{claim.claim}</p>
                    <div className="flex items-center gap-2.5 flex-wrap mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                        style={{ background: confPct >= 80 ? 'rgba(52,211,153,0.08)' : confPct >= 60 ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)', color: confPct >= 80 ? '#34D399' : confPct >= 60 ? '#FBBF24' : '#F87171', border: `1px solid ${confPct >= 80 ? 'rgba(52,211,153,0.2)' : confPct >= 60 ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}` }}
                      >
                        {confPct}%
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                      >
                        {statusIcon(claim.verification_status)}
                        {st.text}
                      </span>
                      {claim.supporting_sources?.length > 0 && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ color: '#34D399', background: 'rgba(52,211,153,0.06)' }}>
                          {claim.supporting_sources.length} supporting
                        </span>
                      )}
                      {claim.contradicting_sources?.length > 0 && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ color: '#F87171', background: 'rgba(248,113,113,0.06)' }}>
                          {claim.contradicting_sources.length} contradicting
                        </span>
                      )}
                    </div>

                    {/* Reasoning */}
                    {claim.reasoning && (
                      <div className="p-4 rounded-xl border mb-3" style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.1)' }}>
                        <p className="text-[11px] text-accent/70 font-semibold mb-2 uppercase tracking-wider">Agent Reasoning</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{claim.reasoning}</p>
                      </div>
                    )}

                    {/* Agent scores */}
                    {claim.agent_scores && Object.keys(claim.agent_scores).length > 0 && (
                      <div className="flex gap-3 mb-3">
                        {Object.entries(claim.agent_scores).map(([agent, score]) => (
                          <div key={agent} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: '#18181D', borderColor: '#222230' }}>
                            <span className="text-[10px] text-text-secondary/50 uppercase tracking-wider">{agent}</span>
                            <span className="font-mono text-xs font-bold text-accent">{Math.round(score * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sources */}
                    {claim.supporting_sources?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] text-green font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Supporting Sources
                        </p>
                        <ul className="space-y-1.5" role="list">
                          {claim.supporting_sources.map((src, si) => (
                            <li key={src || si} className="flex items-center gap-2.5 text-sm text-text-secondary px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.03)' }}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-green/60 shrink-0" />
                              <span className="truncate">{src}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {claim.contradicting_sources?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] text-red font-semibold mb-2 uppercase tracking-wider flex items-center gap-2">
                          <XCircle className="w-3 h-3" /> Contradicting Sources
                        </p>
                        <ul className="space-y-1.5" role="list">
                          {claim.contradicting_sources.map((src, si) => (
                            <li key={src || si} className="flex items-center gap-2.5 text-sm text-text-secondary px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.03)' }}>
                              <XCircle className="w-3.5 h-3.5 text-red/60 shrink-0" />
                              <span className="truncate">{src}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Primary source */}
                    <div className="flex items-center gap-2 text-xs text-text-secondary/50">
                      <ExternalLink className="w-3 h-3" />
                      <span>Source: <span className="text-text-secondary/80">{claim.source}</span></span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Source Trust */}
        {claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border rounded-2xl p-6"
            style={{ background: '#111114', borderColor: '#222230' }}
          >
            <h3 className="font-display text-sm font-semibold mb-4">Source Trust Summary</h3>
            <div className="space-y-2">
              {(() => {
                const sourceMap: Record<string, { cited: number; supported: number; contradicted: number }> = {}
                claims.forEach(c => {
                  if (!sourceMap[c.source]) sourceMap[c.source] = { cited: 0, supported: 0, contradicted: 0 }
                  sourceMap[c.source].cited++
                  c.supporting_sources?.forEach(s => {
                    if (!sourceMap[s]) sourceMap[s] = { cited: 0, supported: 0, contradicted: 0 }
                    sourceMap[s].supported++
                  })
                  c.contradicting_sources?.forEach(s => {
                    if (!sourceMap[s]) sourceMap[s] = { cited: 0, supported: 0, contradicted: 0 }
                    sourceMap[s].contradicted++
                  })
                })
                return Object.entries(sourceMap)
                  .sort(([, a], [, b]) => (b.supported - b.contradicted) - (a.supported - a.contradicted))
                  .slice(0, 8)
                  .map(([name, data]) => {
                    const total = data.supported + data.contradicted || 1
                    const trust = Math.round((data.supported / total) * 100)
                    const trustColor = trust >= 70 ? '#34D399' : trust >= 40 ? '#FBBF24' : '#F87171'
                    return (
                      <div key={name} className="flex items-center gap-4 p-3 rounded-xl border" style={{ background: '#18181D', borderColor: '#222230' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                        </div>
                        <div className="w-24 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: '#1F1F26' }}>
                          <div className="h-full rounded-full" style={{ width: `${trust}%`, background: trustColor }} />
                        </div>
                        <span className="text-xs font-mono font-bold shrink-0" style={{ color: trustColor }}>{trust}%</span>
                      </div>
                    )
                  })
              })()}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
              <span className="text-white text-[8px] font-bold font-mono">Q</span>
            </div>
            <span className="font-display text-xs font-semibold tracking-tight">Quorum</span>
          </div>
          <p className="text-[11px] text-text-secondary/30">Powered by Quorum</p>
        </div>
      </footer>
    </div>
  )
}

export default memo(ReportView)
