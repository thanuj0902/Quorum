import { motion } from 'framer-motion'
import { Users, Eye, Zap } from 'lucide-react'

const points = [
  {
    icon: Users,
    title: 'Four agents, not one',
    desc: 'Not one model — four, checking each other for accuracy.',
  },
  {
    icon: Eye,
    title: 'Full transparency',
    desc: 'Every claim sourced. Every score explainable with evidence.',
  },
  {
    icon: Zap,
    title: 'Live disagreement',
    desc: 'Agents disagree in real time — you see the real process.',
  },
]

export default function WhyDifferent() {
  return (
    <section className="py-28 px-6" aria-labelledby="why-different-heading">
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
              className="group relative p-6 bg-surface border border-border rounded-2xl hover:border-border-hover transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden="true" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent-dim border border-accent/15 flex items-center justify-center mb-4 group-hover:border-accent/30 transition-colors" aria-hidden="true">
                  <point.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{point.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
