import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Database, TrendingUp, TrendingDown, Shield } from 'lucide-react'
import { sourceTrustClass } from '../../utils/colors'

function SourceTrustLedger({ report }) {
  const sources = useMemo(() => {
    if (!report?.claims?.length) return []

    const sourceMap = {}

    report.claims.forEach(claim => {
      if (!sourceMap[claim.source]) {
        sourceMap[claim.source] = { name: claim.source, cited: 0, supported: 0, contradicted: 0 }
      }
      sourceMap[claim.source].cited++

      claim.supporting_sources?.forEach(src => {
        if (!sourceMap[src]) sourceMap[src] = { name: src, cited: 0, supported: 0, contradicted: 0 }
        sourceMap[src].supported++
      })

      claim.contradicting_sources?.forEach(src => {
        if (!sourceMap[src]) sourceMap[src] = { name: src, cited: 0, supported: 0, contradicted: 0 }
        sourceMap[src].contradicted++
      })
    })

    return Object.values(sourceMap)
      .sort((a, b) => (b.supported - b.contradicted) - (a.supported - a.contradicted))
      .slice(0, 10)
  }, [report])

  if (sources.length === 0) return null

  const topTrust = sources.length > 0 ? Math.round((sources[0].supported / (sources[0].supported + sources[0].contradicted || 1)) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border rounded-2xl p-6"
      style={{ background: '#111114', borderColor: '#222230' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }} aria-hidden="true">
            <Database className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Source Trust Ledger</h3>
            <p className="text-[11px] text-text-secondary/50">{sources.length} sources ranked by reliability</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)' }}>
          <Shield className="w-3.5 h-3.5 text-green" />
          <span className="text-xs font-mono font-bold text-green">{topTrust}% top source</span>
        </div>
      </div>

      <ul className="space-y-2" role="list" aria-label="Source reliability scores">
        {sources.map((src, i) => {
          const total = src.supported + src.contradicted || 1
          const trust = Math.round((src.supported / total) * 100)
          const trustColor = trust >= 70 ? '#34D399' : trust >= 40 ? '#FBBF24' : '#F87171'

          return (
            <motion.li
              key={src.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-4 p-3.5 rounded-xl border transition-colors"
              style={{ background: '#18181D', borderColor: '#222230' }}
            >
              {/* Rank badge */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: i === 0 ? 'rgba(52,211,153,0.1)' : '#1F1F26', border: `1px solid ${i === 0 ? 'rgba(52,211,153,0.2)' : '#222230'}` }}>
                <span className="text-[11px] font-mono font-bold" style={{ color: i === 0 ? '#34D399' : '#555' }}>
                  {i + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-1.5">{src.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-secondary/50 font-mono">
                    Cited: {src.cited}
                  </span>
                  <span className="text-[11px] font-mono flex items-center gap-0.5" style={{ color: '#34D399' }}>
                    <TrendingUp className="w-2.5 h-2.5" aria-hidden="true" /> {src.supported}
                  </span>
                  <span className="text-[11px] font-mono flex items-center gap-0.5" style={{ color: '#F87171' }}>
                    <TrendingDown className="w-2.5 h-2.5" aria-hidden="true" /> {src.contradicted}
                  </span>
                </div>
                {/* Trust bar */}
                <div className="w-full h-1 rounded-full overflow-hidden mt-2.5" style={{ background: '#1F1F26' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trust}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i }}
                    className="h-full rounded-full"
                    style={{ background: trustColor }}
                  />
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold" style={{ color: trustColor }}>
                  {trust}%
                </div>
                <div className="text-[10px] text-text-secondary/40 mt-0.5">trust</div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </motion.div>
  )
}

export default memo(SourceTrustLedger)
