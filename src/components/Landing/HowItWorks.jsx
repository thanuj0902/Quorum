import { motion } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'

const steps = [
  { icon: Search, label: 'Research', desc: 'Extracts claims from sources' },
  { icon: ShieldCheck, label: 'Verify', desc: 'Cross-checks independently' },
  { icon: AlertTriangle, label: 'Detect', desc: 'Flags conflicts & hallucinations' },
  { icon: FileText, label: 'Synthesize', desc: 'Citation-backed report' },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6" aria-labelledby="how-it-works-heading">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Process</p>
          <h2 id="how-it-works-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">How it works</h2>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4 flex-1 w-full md:w-auto"
            >
              <div className="flex items-center gap-4 flex-1 bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent/15 flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors" aria-hidden="true">
                  <step.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold">{step.label}</div>
                  <div className="text-text-secondary text-xs mt-0.5">{step.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block text-accent/30 text-lg shrink-0 px-1" aria-hidden="true">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
