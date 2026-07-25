import { motion } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, FileText, type LucideIcon } from 'lucide-react'

interface Step {
  icon: LucideIcon
  label: string
  desc: string
  color: 'accent' | 'green' | 'orange'
}

const steps: Step[] = [
  { icon: Search, label: 'Research', desc: 'Extracts claims from multiple sources', color: 'accent' },
  { icon: ShieldCheck, label: 'Verify', desc: 'Cross-checks each claim independently', color: 'green' },
  { icon: AlertTriangle, label: 'Detect', desc: 'Flags conflicts & hallucinations', color: 'orange' },
  { icon: FileText, label: 'Synthesize', desc: 'Citation-backed report with scores', color: 'accent' },
]

const colorMap = {
  accent: { bg: 'bg-accent-dim', border: 'border-accent/15', text: 'text-accent', hover: 'hover:border-accent/40' },
  green: { bg: 'bg-green-dim', border: 'border-green/15', text: 'text-green', hover: 'hover:border-green/40' },
  orange: { bg: 'bg-orange/10', border: 'border-orange/15', text: 'text-orange', hover: 'hover:border-orange/40' },
}

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" aria-labelledby="how-it-works-heading">
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

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[40px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent/30 via-green/30 to-accent/30" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((step, i) => {
              const c = colorMap[step.color]
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="text-center">
                    {/* Step number + icon */}
                    <div className="relative inline-flex mb-5">
                      <div className={`w-16 h-16 rounded-2xl ${c.bg} border ${c.border} ${c.hover} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                        style={{ boxShadow: 'none' }}
                        ref={(el) => {
                          if (el) {
                            el.addEventListener('mouseenter', () => {
                              el.style.boxShadow = `0 0 30px ${step.color === 'accent' ? 'rgba(124,58,237,0.2)' : step.color === 'green' ? 'rgba(52,211,153,0.2)' : 'rgba(251,146,60,0.2)'}`
                            })
                            el.addEventListener('mouseleave', () => {
                              el.style.boxShadow = 'none'
                            })
                          }
                        }}
                      >
                        <step.icon className={`w-6 h-6 ${c.text}`} strokeWidth={1.5} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base border border-border text-[10px] text-text-secondary font-mono flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold mb-1.5">{step.label}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
