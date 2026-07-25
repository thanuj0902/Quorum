import { motion } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, FileText, type LucideIcon } from 'lucide-react'

interface Step {
  icon: LucideIcon
  label: string
  title: string
  desc: string
  details: string
  color: 'accent' | 'green' | 'orange'
}

const steps: Step[] = [
  {
    icon: Search,
    label: 'Step 1',
    title: 'Research Agent',
    desc: 'Extracts factual claims from your input and gathers sources with initial confidence scores.',
    details: 'The Research Agent parses your input text, identifies distinct factual claims, and searches for supporting evidence. Each claim is tagged with source citations and an initial confidence rating based on source reliability.',
    color: 'accent',
  },
  {
    icon: ShieldCheck,
    label: 'Step 2',
    title: 'Verification Agent',
    desc: 'Independently cross-references each claim against reliable sources and adjusts confidence.',
    details: 'The Verification Agent takes each claim from the Research phase and independently verifies it against additional sources. Confidence scores are adjusted up or down based on corroborating or contradicting evidence.',
    color: 'green',
  },
  {
    icon: AlertTriangle,
    label: 'Step 3',
    title: 'Hallucination Detector',
    desc: 'Finds contradictions between claims and flags potential hallucinations or fabricated data.',
    details: 'The Hallucination Detector compares claims for internal consistency, checks for common AI fabrication patterns, flags statistical anomalies, and identifies claims that lack sufficient source coverage. Detected issues are flagged with severity levels.',
    color: 'orange',
  },
  {
    icon: FileText,
    label: 'Step 4',
    title: 'Synthesis Agent',
    desc: 'Compiles a citation-backed report with per-claim confidence scores and executive summary.',
    details: 'The Synthesis Agent takes all findings and compiles them into a structured verification report. Each claim receives a final confidence score, supporting evidence summary, and citation trail. The report includes an executive summary of overall claim reliability.',
    color: 'accent',
  },
]

const colorMap = {
  accent: { bg: 'bg-accent-dim', border: 'border-accent/15', text: 'text-accent', hover: 'hover:border-accent/40' },
  green: { bg: 'bg-green-dim', border: 'border-green/15', text: 'text-green', hover: 'hover:border-green/40' },
  orange: { bg: 'bg-orange/10', border: 'border-orange/15', text: 'text-orange', hover: 'hover:border-orange/40' },
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" aria-labelledby="how-it-works-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Process</p>
          <h2 id="how-it-works-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">How Quorum's Multi-Agent Verification Works</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-xl mx-auto">
            Each verification runs through four specialized AI agents in sequence. Every agent works independently, ensuring no single point of failure in the fact-checking process. The multi-agent approach produces more reliable results than single-model verification.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[40px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent/30 via-green/30 to-accent/30" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((step, i) => {
              const c = colorMap[step.color]
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="text-center">
                    <div className="relative inline-flex mb-5">
                      {/* Floating glow behind icon */}
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 4, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute inset-0 rounded-2xl blur-xl ${c.bg}`}
                        aria-hidden="true"
                      />
                      <div className={`relative w-16 h-16 rounded-2xl ${c.bg} border ${c.border} ${c.hover} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                        <step.icon className={`w-6 h-6 ${c.text}`} strokeWidth={1.5} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base border border-border text-[10px] text-text-secondary font-mono flex items-center justify-center">
                        {i + 1}
                      </span>
                      {/* Floating dot */}
                      <motion.div
                        animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3 + i, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${c.text} bg-current opacity-30`}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="font-display text-base font-semibold mb-1">{step.title}</h3>
                    <p className="text-text-secondary text-xs leading-relaxed max-w-[200px] mx-auto mb-2">{step.desc}</p>
                    <p className="text-text-secondary/40 text-[11px] leading-relaxed max-w-[200px] mx-auto hidden md:block">{step.details}</p>
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
