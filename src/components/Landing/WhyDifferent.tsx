import { motion } from 'framer-motion'
import { Users, Eye, Zap, type LucideIcon } from 'lucide-react'

interface Point {
  icon: LucideIcon
  title: string
  desc: string
  stat: string
  statLabel: string
}

const points: Point[] = [
  {
    icon: Users,
    title: 'Four agents, not one',
    desc: 'Four models cross-checking each other for accuracy — not a single AI guessing.',
    stat: '4x',
    statLabel: 'verification',
  },
  {
    icon: Eye,
    title: 'Full transparency',
    desc: 'Every claim sourced. Every score backed by evidence you can trace.',
    stat: '100%',
    statLabel: 'explainable',
  },
  {
    icon: Zap,
    title: 'Live disagreement',
    desc: 'Agents disagree in real time — you see the real verification process.',
    stat: 'Real-time',
    statLabel: 'detection',
  },
]

export default function WhyDifferent() {
  return (
    <section className="py-24 px-6" aria-labelledby="why-different-heading">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why different</p>
          <h2 id="why-different-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Built for trust, not speed</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-6 bg-surface border border-border rounded-2xl hover:border-accent/20 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-dim border border-accent/15 flex items-center justify-center group-hover:border-accent/30 group-hover:scale-110 transition-all duration-300" aria-hidden="true">
                    <point.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="font-display text-lg font-bold text-accent/60">{point.stat}</span>
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{point.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{point.desc}</p>
                <p className="text-[11px] text-text-secondary/40 font-mono mt-3 uppercase tracking-wider">{point.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
