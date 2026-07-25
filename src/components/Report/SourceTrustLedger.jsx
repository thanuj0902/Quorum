import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Database, TrendingUp, TrendingDown } from 'lucide-react'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-surface border border-border rounded-2xl p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent-dim border border-accent/15 flex items-center justify-center" aria-hidden="true">
          <Database className="w-4 h-4 text-accent" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-semibold">Source Trust Ledger</h3>
      </div>

      <ul className="space-y-2" role="list" aria-label="Source reliability scores">
        {sources.map((src, i) => {
          const total = src.supported + src.contradicted || 1
          const trust = Math.round((src.supported / total) * 100)

          return (
            <motion.li
              key={src.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-4 p-3.5 bg-surface-2/60 rounded-xl border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-1.5">{src.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-text-secondary/60 font-mono">
                    Cited: {src.cited}
                  </span>
                  <span className="text-[11px] text-green font-mono flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" aria-hidden="true" /> {src.supported}
                  </span>
                  <span className="text-[11px] text-red font-mono flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" aria-hidden="true" /> {src.contradicted}
                  </span>
                </div>
                {/* Trust bar */}
                <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden mt-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trust}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i }}
                    className={`h-full rounded-full ${trust >= 70 ? 'bg-green' : trust >= 40 ? 'bg-yellow' : 'bg-red'}`}
                  />
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className={`text-sm font-mono font-bold ${sourceTrustClass(trust)}`}>
                  {trust}%
                </div>
                <div className="text-[10px] text-text-secondary/50 mt-0.5">trust</div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </motion.div>
  )
}

export default memo(SourceTrustLedger)
