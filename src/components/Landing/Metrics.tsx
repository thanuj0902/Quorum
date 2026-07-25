import { motion } from 'framer-motion'
import { Cpu, Clock, Shield, Layers, type LucideIcon } from 'lucide-react'

interface Metric {
  icon: LucideIcon
  value: string
  label: string
  desc: string
}

const metrics: Metric[] = [
  { icon: Cpu, value: '4', label: 'Independent AI Agents', desc: 'Research, Verification, Hallucination Detection, and Synthesis agents working independently' },
  { icon: Clock, value: '<15s', label: 'Full Pipeline', desc: 'End-to-end multi-agent claim verification in under 15 seconds' },
  { icon: Shield, value: '0', label: 'Fabricated Claims', desc: 'Built-in hallucination detection catches AI fabrications before they reach your report' },
  { icon: Layers, value: '12+', label: 'Sources Cross-Referenced', desc: 'Multiple independent sources verified per claim for maximum reliability' },
]

export default function Metrics() {
  return (
    <section id="features" className="py-24 px-6" aria-labelledby="metrics-heading">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Architecture</p>
          <h2 id="metrics-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Quorum's Multi-Agent Architecture</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
            Four specialized AI agents working independently in a verification pipeline, cross-checking each other for maximum reliability. Built for accuracy, not just speed.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative text-center p-6 border rounded-2xl transition-all duration-300 overflow-hidden"
              style={{ background: '#111114', borderColor: '#222230' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222230'}
            >
              {/* Floating accent glow */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.2, 0.08] }}
                transition={{ duration: 5, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-accent/10 blur-xl"
                aria-hidden="true"
              />
              {/* Floating dot */}
              <motion.div
                animate={{ y: [0, -5, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4 + i, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-accent/30"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <m.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div className="font-display text-3xl font-bold text-accent mb-1">{m.value}</div>
                <div className="text-sm font-semibold mb-1">{m.label}</div>
                <div className="text-xs text-text-secondary/50 leading-relaxed">{m.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
