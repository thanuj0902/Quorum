import { motion, type Variants } from 'framer-motion'
import { Bot, Link2, Clock, Globe, type LucideIcon } from 'lucide-react'

interface Stat {
  icon: LucideIcon
  value: string
  label: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
}

const stats: Stat[] = [
  { icon: Bot, value: '4', label: 'Independent AI Agents', color: '#A78BFA', bgClass: 'bg-accent/10', borderClass: 'border-accent/25', textClass: 'text-accent' },
  { icon: Globe, value: '2', label: 'Search Providers', color: '#34D399', bgClass: 'bg-green/10', borderClass: 'border-green/25', textClass: 'text-green' },
  { icon: Link2, value: '100%', label: 'Source-Backed Claims', color: '#60A5FA', bgClass: 'bg-blue-400/10', borderClass: 'border-blue-400/25', textClass: 'text-blue-400' },
  { icon: Clock, value: '<30s', label: 'Full Pipeline', color: '#FBBF24', bgClass: 'bg-yellow/10', borderClass: 'border-yellow/25', textClass: 'text-yellow' },
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function StatsBar() {
  return (
    <section className="py-12 px-6 border-y border-border/30" aria-label="System statistics">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="flex items-center gap-3 justify-center md:justify-start"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${stat.bgClass} ${stat.borderClass}`}>
                <stat.icon className={`w-4 h-4 ${stat.textClass}`} strokeWidth={1.5} />
              </div>
              <div>
                <div className={`font-display text-xl font-bold ${stat.textClass}`}>{stat.value}</div>
                <div className="text-[11px] text-text-secondary/50 font-medium leading-tight">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
