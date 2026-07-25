import { motion } from 'framer-motion'
import { Cpu, Clock, Shield, Layers, type LucideIcon } from 'lucide-react'

interface Metric {
  icon: LucideIcon
  value: string
  label: string
  desc: string
}

const metrics: Metric[] = [
  { icon: Cpu, value: '4', label: 'Independent AI Agents', desc: 'Each specializing in a verification task' },
  { icon: Clock, value: '<15s', label: 'Full Pipeline', desc: 'End-to-end claim verification' },
  { icon: Shield, value: '0', label: 'Fabricated Claims', desc: 'Hallucination detection built in' },
  { icon: Layers, value: '12+', label: 'Sources Cross-Referenced', desc: 'Per verification run' },
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
          <h2 id="metrics-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Multi-agent by design</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-md mx-auto">Four specialized agents working independently, cross-checking each other for maximum reliability.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative text-center p-6 border rounded-2xl transition-all duration-300"
              style={{ background: '#111114', borderColor: '#222230' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222230'}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <m.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              </div>
              <div className="font-display text-3xl font-bold text-accent mb-1">{m.value}</div>
              <div className="text-sm font-semibold mb-1">{m.label}</div>
              <div className="text-xs text-text-secondary/50">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
