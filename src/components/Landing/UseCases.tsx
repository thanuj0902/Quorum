import { motion } from 'framer-motion'
import { GraduationCap, Newspaper, Building2, BookOpen, type LucideIcon } from 'lucide-react'

interface UseCase {
  icon: LucideIcon
  title: string
  desc: string
  examples: string[]
}

const useCases: UseCase[] = [
  {
    icon: Newspaper,
    title: 'Journalism & Media',
    desc: 'Journalists use Quorum to verify breaking news claims, political statements, and statistical data before publication. Multi-agent verification ensures accuracy where single-model tools fall short.',
    examples: ['Political fact-checking', 'Statistical verification', 'Source cross-referencing'],
  },
  {
    icon: GraduationCap,
    title: 'Academic Research',
    desc: 'Researchers and students verify citations, cross-reference scientific claims, and validate data points in papers. Quorum provides the evidence trail needed for academic rigor.',
    examples: ['Citation verification', 'Data validation', 'Literature review support'],
  },
  {
    icon: Building2,
    title: 'Business Intelligence',
    desc: 'Teams verify market claims, competitor assertions, and industry statistics. Batch verification lets you check multiple claims at once for due diligence and competitive analysis.',
    examples: ['Market claim verification', 'Competitor analysis', 'Due diligence checks'],
  },
  {
    icon: BookOpen,
    title: 'Content Creation',
    desc: 'Content creators and publishers verify facts before sharing. Every Quorum report includes source citations and confidence scores, making it easy to present verified information to your audience.',
    examples: ['Blog post fact-checking', 'Social media verification', 'Newsletter accuracy'],
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 px-6" aria-labelledby="use-cases-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Use Cases</p>
          <h2 id="use-cases-heading" className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">Who Uses Quorum?</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-lg mx-auto">
            From journalists verifying breaking news to researchers validating citations, Quorum serves anyone who needs AI-powered fact-verification with explainable results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-6 bg-surface border border-border rounded-2xl hover:border-accent/20 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" aria-hidden="true" />

              {/* Floating decorative ring */}
              <motion.div
                animate={{ rotate: [0, 360], opacity: [0.04, 0.1, 0.04] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full border border-accent/10"
                aria-hidden="true"
              />
              {/* Floating dot */}
              <motion.div
                animate={{ y: [0, -5, 0], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 6, delay: i * 1, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-accent/25"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-dim border border-accent/15 flex items-center justify-center group-hover:border-accent/30 transition-all duration-300" aria-hidden="true">
                    <uc.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-base font-semibold">{uc.title}</h3>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-4">{uc.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {uc.examples.map((ex) => (
                    <span key={ex} className="inline-flex items-center px-2.5 py-1 text-[11px] text-text-secondary/60 bg-white/[0.03] border border-border rounded-lg font-mono">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
