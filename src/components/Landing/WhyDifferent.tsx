import { motion } from 'framer-motion'
import { Users, Eye, Zap, type LucideIcon } from 'lucide-react'

interface Point {
  icon: LucideIcon
  title: string
  desc: string
  details: string
  stat: string
  statLabel: string
}

const points: Point[] = [
  {
    icon: Users,
    title: 'Four agents, not one',
    desc: 'Four independent AI models cross-check each other for accuracy — not a single AI guessing at the truth.',
    details: 'Unlike single-model fact-checkers, Quorum uses a pipeline where each agent operates independently. The Research Agent, Verification Agent, Hallucination Detector, and Synthesis Agent all contribute separate assessments, reducing bias and catching errors.',
    stat: '4x',
    statLabel: 'verification depth',
  },
  {
    icon: Eye,
    title: 'Full transparency',
    desc: 'Every claim is sourced. Every confidence score is backed by evidence you can trace back to its origin.',
    details: 'Quorum never makes unsupported assertions. Every confidence score links to source citations, agent reasoning, and evidence summaries. You can trace any claim back to its original sources and see exactly how each agent evaluated it.',
    stat: '100%',
    statLabel: 'explainable results',
  },
  {
    icon: Zap,
    title: 'Real-time detection',
    desc: 'Agents disagree in real time, flagging conflicts and hallucinations as they are discovered during verification.',
    details: 'The pipeline runs in real time with a live visualization showing each agent processing your claim. Hallucination detection happens inline — fabricated data and contradictions are flagged immediately as the agents discover them.',
    stat: 'Real-time',
    statLabel: 'detection pipeline',
  },
]

export default function WhyDifferent() {
  return (
    <section id="why-different" className="py-24 px-6" aria-labelledby="why-different-heading">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why different</p>
          <h2 id="why-different-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Multi-Agent Verification vs Single-Model Fact-Checking</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
            Traditional fact-checkers rely on a single AI model, which can hallucinate or introduce bias. Quorum uses four independent agents that cross-verify each other, producing more reliable and transparent results.
          </p>
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
              <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />

              {/* Floating accent dot */}
              <motion.div
                animate={{ y: [0, -6, 0], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 5, delay: i * 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent/25"
                aria-hidden="true"
              />

              {/* Floating corner ring */}
              <motion.div
                animate={{ rotate: [0, 360], opacity: [0.06, 0.12, 0.06] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full border border-accent/10"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-dim border border-accent/15 flex items-center justify-center group-hover:border-accent/30 group-hover:scale-110 transition-all duration-300" aria-hidden="true">
                    <point.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="font-display text-lg font-bold text-accent/60">{point.stat}</span>
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{point.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-2">{point.desc}</p>
                <p className="text-text-secondary/40 text-xs leading-relaxed hidden md:block">{point.details}</p>
                <p className="text-[11px] text-text-secondary/40 font-mono mt-3 uppercase tracking-wider">{point.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
