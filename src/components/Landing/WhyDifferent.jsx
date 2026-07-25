import { motion } from 'framer-motion'
import { Users, Eye, Zap } from 'lucide-react'

const points = [
  { icon: Users, title: 'Four agents, not one', desc: 'Four models checking each other for accuracy.' },
  { icon: Eye, title: 'Full transparency', desc: 'Every claim sourced. Every score explainable.' },
  { icon: Zap, title: 'Live disagreement', desc: 'Agents disagree in real time — you see it.' },
]

export default function WhyDifferent() {
  return (
    <section className="py-20 px-6" aria-labelledby="why-different-heading">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Why different</p>
          <h2 id="why-different-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Built for trust, not speed</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group p-5 bg-surface border border-border rounded-2xl hover:border-accent/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent-dim border border-accent/15 flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors" aria-hidden="true">
                  <point.icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-sm font-semibold">{point.title}</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
