import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, FileText, BarChart3, AlertTriangle, Clock, Search } from 'lucide-react'
import Logo from '../ui/Logo'
import type { HistoryEntry } from '../../types'

interface HistoryViewProps {
  history: HistoryEntry[]
  stats: {
    totalReports: number
    totalClaims: number
    avgConfidence: number
    totalFlagged: number
  }
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onBack: () => void
}

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function confidenceBadge(score: number) {
  const pct = Math.round(score * 100)
  if (pct >= 80) return { color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' }
  if (pct >= 60) return { color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' }
  return { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' }
}

const statCards = [
  { key: 'totalReports' as const, label: 'Total Reports', icon: FileText, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' },
  { key: 'totalClaims' as const, label: 'Claims Verified', icon: BarChart3, color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
  { key: 'avgConfidence' as const, label: 'Avg Confidence', icon: Clock, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
  { key: 'totalFlagged' as const, label: 'Flagged', icon: AlertTriangle, color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)' },
] as const

function HistoryView({ history, stats, onSelect, onDelete, onBack }: HistoryViewProps) {
  const sorted = useMemo(() =>
    [...history].sort((a, b) => b.timestamp - a.timestamp),
    [history]
  )

  return (
    <>
      <nav className="sticky top-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onBack} />
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon
            const value = stats[card.key]
            const display = card.key === 'avgConfidence' ? `${Math.round(value)}%` : value.toString()
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-4 rounded-xl border"
                style={{ background: '#111114', borderColor: '#222230' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: card.bg, border: `1px solid ${card.border}` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <div>
                  <div className="font-mono text-lg font-bold" style={{ color: card.color }}>{display}</div>
                  <div className="text-[10px] text-text-secondary/50 uppercase tracking-wider">{card.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* History list */}
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}
            >
              <Search className="w-7 h-7 text-accent/40" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-sm text-text-secondary/50 max-w-xs">
              Run your first verification to get started
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Verification history">
            {sorted.map((entry, i) => {
              const badge = confidenceBadge(entry.overall_confidence)
              const pct = Math.round(entry.overall_confidence * 100)
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  role="listitem"
                  className="group relative border rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:border-border-hover"
                  style={{ background: '#111114', borderColor: '#222230' }}
                  onClick={() => onSelect(entry.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2 mb-2.5">
                        {entry.topic}
                      </p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                        >
                          {pct}%
                        </span>
                        <span className="text-[11px] text-text-secondary/40 font-mono">
                          {entry.claims_count} claims
                        </span>
                        <span className="text-[11px] text-text-secondary/40 font-mono">
                          {relativeTime(entry.timestamp)}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-secondary/40 hover:text-red shrink-0"
                      aria-label={`Delete report: ${entry.topic}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}

export default memo(HistoryView)
