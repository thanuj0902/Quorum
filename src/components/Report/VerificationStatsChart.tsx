import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, AlertTriangle, CheckCircle2, MinusCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import type { VerificationReport } from '../../types'

interface VerificationStatsChartProps {
  report: VerificationReport
}

function VerificationStatsChart({ report }: VerificationStatsChartProps) {
  const stats = report.confidence_stats
  const hallucinationStats = report.hallucination_stats
  const claimStatus = report.claim_status_breakdown

  // Claim status bar chart data
  const statusData = useMemo(() => {
    if (!claimStatus) return []
    return [
      { name: 'Verified', value: claimStatus.verified, color: '#34D399' },
      { name: 'Partial', value: claimStatus.partially_verified, color: '#FBBF24' },
      { name: 'Unverified', value: claimStatus.unverified, color: '#7A7A95' },
      { name: 'Contradicted', value: claimStatus.contradicted, color: '#F87171' },
    ].filter(d => d.value > 0)
  }, [claimStatus])

  // Confidence distribution data
  const distributionData = useMemo(() => {
    if (!stats?.distribution) return []
    return [
      { name: 'High (75%+)', value: stats.distribution.high, color: '#34D399' },
      { name: 'Medium (45-74%)', value: stats.distribution.medium, color: '#FBBF24' },
      { name: 'Low (<45%)', value: stats.distribution.low, color: '#F87171' },
    ].filter(d => d.value > 0)
  }, [stats])

  // Hallucination pie data
  const hallucinationPieData = useMemo(() => {
    if (!hallucinationStats) return []
    const clean = hallucinationStats.total_claims - hallucinationStats.hallucinations_detected
    return [
      { name: 'Clean', value: Math.max(clean, 0), color: '#34D399' },
      { name: 'Hallucinations', value: hallucinationStats.hallucinations_detected, color: '#F87171' },
    ].filter(d => d.value > 0)
  }, [hallucinationStats])

  const hRate = hallucinationStats ? Math.round(hallucinationStats.hallucination_rate * 100) : 0

  if (!stats && !hallucinationStats && !claimStatus) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="border rounded-2xl p-6"
      style={{ background: '#111114', borderColor: '#222230' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }} aria-hidden="true">
            <BarChart3 className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Verification Statistics</h3>
            <p className="text-[11px] text-text-secondary/50">Aggregate metrics across all claims</p>
          </div>
        </div>
        {hallucinationStats && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: hRate > 30 ? 'rgba(248,113,113,0.06)' : 'rgba(52,211,153,0.06)', borderColor: hRate > 30 ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)' }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: hRate > 30 ? '#F87171' : '#34D399' }} />
            <span className="text-xs font-mono font-bold" style={{ color: hRate > 30 ? '#F87171' : '#34D399' }}>{hRate}% hallucination rate</span>
          </div>
        )}
      </div>

      {/* Confidence Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Mean', value: `${Math.round(stats.mean * 100)}%`, icon: <TrendingUp className="w-3 h-3" /> },
            { label: 'Median', value: `${Math.round(stats.median * 100)}%`, icon: <TrendingUp className="w-3 h-3" /> },
            { label: 'Std Dev', value: `±${Math.round(stats.stdev * 100)}%`, icon: <TrendingUp className="w-3 h-3" /> },
            { label: 'Min', value: `${Math.round(stats.min * 100)}%`, icon: <MinusCircle className="w-3 h-3" /> },
            { label: 'Max', value: `${Math.round(stats.max * 100)}%`, icon: <CheckCircle2 className="w-3 h-3" /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-3 border text-center" style={{ background: '#18181D', borderColor: '#222230' }}>
              <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <span className="text-accent/50">{stat.icon}</span>
                {stat.label}
              </div>
              <div className="font-mono text-sm font-bold text-text">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claim Status Breakdown */}
        {statusData.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider mb-3">Claim Status Breakdown</h4>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#7A7A95', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: '#222230' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#7A7A95', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181D', border: '1px solid #222230', borderRadius: '10px', fontSize: '12px', color: '#F0F0F5' }}
                    formatter={(value) => [`${value}`, 'Claims']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Hallucination Pie */}
        {hallucinationPieData.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider mb-3">Hallucination Rate</h4>
            <div className="flex items-center gap-4">
              <div className="h-[140px] w-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hallucinationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {hallucinationPieData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#18181D', border: '1px solid #222230', borderRadius: '10px', fontSize: '12px', color: '#F0F0F5' }}
                      formatter={(value, name) => [`${value} claims`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {hallucinationPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                    <span className="text-xs text-text-secondary/60">{entry.name}</span>
                    <span className="text-xs font-mono font-bold text-text">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confidence Distribution Bars */}
      {distributionData.length > 0 && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: '#222230' }}>
          <h4 className="text-xs font-semibold text-text-secondary/60 uppercase tracking-wider mb-3">Confidence Distribution</h4>
          <div className="space-y-2">
            {distributionData.map((d) => {
              const total = distributionData.reduce((s, x) => s + x.value, 0)
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-secondary/50 w-28 shrink-0 font-mono">{d.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1F1F26' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-text w-10 text-right">{d.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default memo(VerificationStatsChart)
