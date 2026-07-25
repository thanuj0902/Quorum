import { motion } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'

const steps = [
  { icon: Search, label: 'Research', desc: 'Extracts claims from multiple sources' },
  { icon: ShieldCheck, label: 'Verify', desc: 'Cross-checks each claim independently' },
  { icon: AlertTriangle, label: 'Detect Contradictions', desc: 'Flags conflicts and hallucinations' },
  { icon: FileText, label: 'Synthesize', desc: 'Citation-backed report with scores' },
]

export default function HowItWorks() {
  return (
    <section className="py-28 px-6" aria-labelledby="how-it-works-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Process</p>
          <h2 id="how-it-works-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">How it works</h2>
        </motion.div>

        <ol className="grid grid-cols-1 md:grid-cols-4 gap-5 list-none" role="list">
          {steps.map((step, i) => (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent-dim border border-accent/15 flex items-center justify-center mx-auto mb-5 group-hover:border-accent/30 group-hover:bg-accent/[0.14] transition-all duration-300" aria-hidden="true">
                  <step.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-[11px] text-accent/60 font-mono mb-2 tracking-wider">0{i + 1}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.label}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-8 -right-3 items-center" aria-hidden="true">
                  <div className="w-6 h-px bg-gradient-to-r from-accent/30 to-transparent" />
                  <div className="w-1 h-1 rounded-full bg-accent/30" />
                </div>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
