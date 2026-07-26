import { motion } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, FileText, ExternalLink, CheckCircle2, TrendingUp } from 'lucide-react'

const agents = [
  { icon: Search, label: 'Research', color: '#60A5FA', status: 'Extracted 5 claims from 8 sources', time: '1.3s' },
  { icon: ShieldCheck, label: 'Verifier', color: '#34D399', status: '3 verified, 1 partial, 1 unverified', time: '1.0s' },
  { icon: AlertTriangle, label: 'Detector', color: '#FBBF24', status: '0 hallucinations, 1 unsubstantiated', time: '1.2s' },
  { icon: FileText, label: 'Synthesizer', color: '#A78BFA', status: 'Report compiled with 5 claims', time: '0.8s' },
]

const mockClaims = [
  { text: 'India became independent in 1947', confidence: 98, status: 'verified', sources: 4 },
  { text: 'The Taj Mahal was built by Shah Jahan', confidence: 92, status: 'verified', sources: 3 },
  { text: 'Bollywood produces 2000+ films annually', confidence: 67, status: 'partial', sources: 2 },
]

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  verified: { bg: 'rgba(52,211,153,0.08)', text: '#34D399', border: 'rgba(52,211,153,0.2)' },
  partial: { bg: 'rgba(251,191,36,0.08)', text: '#FBBF24', border: 'rgba(251,191,36,0.2)' },
}

export default function DemoPreview() {
  return (
    <section className="py-24 px-6" aria-labelledby="demo-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Live Demo</p>
          <h2 id="demo-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">See Quorum in Action</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
            Real-time multi-agent pipeline visualization with live status updates from each AI agent.
          </p>
        </motion.div>

        {/* Pipeline Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border overflow-hidden"
          style={{ background: '#0D0D10', borderColor: '#222230' }}
        >
          {/* Terminal-style header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: '#222230', background: '#111114' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[11px] text-text-secondary/40 font-mono ml-2">quorum-pipeline — live verification</span>
          </div>

          <div className="p-6 md:p-8">
            {/* Query */}
            <div className="mb-6 px-4 py-2.5 rounded-xl border" style={{ background: '#18181D', borderColor: '#222230' }}>
              <span className="text-[10px] text-accent/60 font-mono uppercase tracking-wider">Topic</span>
              <p className="text-sm text-text mt-0.5 font-medium">Independence Day of India — history and significance</p>
            </div>

            {/* Agent Steps */}
            <div className="space-y-3 mb-8">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border"
                  style={{ background: '#18181D', borderColor: '#222230' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${agent.color}12`, border: `1px solid ${agent.color}25` }}>
                    <agent.icon className="w-4 h-4" style={{ color: agent.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{agent.label} Agent</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>done</span>
                    </div>
                    <p className="text-[11px] text-text-secondary/50 mt-0.5 truncate">{agent.status}</p>
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary/40 shrink-0">{agent.time}</span>
                </motion.div>
              ))}
            </div>

            {/* Output Report Preview */}
            <div className="border rounded-2xl p-5" style={{ borderColor: '#222230', background: '#111114' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm font-display font-semibold">Claim-Level Report</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.12)' }}>
                  <CheckCircle2 className="w-3 h-3 text-green" />
                  <span className="text-[11px] font-mono font-bold text-green">85% overall</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {mockClaims.map((claim) => {
                  const sc = statusColors[claim.status] || statusColors.verified
                  return (
                    <div key={claim.text} className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ background: '#18181D', borderColor: '#222230' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1.5">{claim.text}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                            {claim.status === 'verified' ? 'Verified' : 'Partial'}
                          </span>
                          <span className="text-[10px] text-text-secondary/40 font-mono">{claim.sources} sources</span>
                          <span className="text-[10px] text-text-secondary/40">|</span>
                          <ExternalLink className="w-2.5 h-2.5 text-accent/50" />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-bold text-green">{claim.confidence}%</div>
                        <div className="text-[9px] text-text-secondary/30 mt-0.5">confidence</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#222230' }}>
                <span className="text-[11px] text-text-secondary/30 font-mono">3 claims · 9 sources · 0 hallucinations</span>
                <span className="text-[11px] text-text-secondary/30 font-mono">Total: 4.3s</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
