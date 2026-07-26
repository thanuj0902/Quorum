import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Shield, Search, GitBranch, FileCheck } from 'lucide-react'

interface HeroProps {
  onStart: () => void
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

const dots = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 4,
}))

const agentIcons = [
  { icon: Search, label: 'Research', color: '#60A5FA' },
  { icon: GitBranch, label: 'Verify', color: '#34D399' },
  { icon: Shield, label: 'Detect', color: '#FBBF24' },
  { icon: FileCheck, label: 'Report', color: '#A78BFA' },
]

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden" aria-labelledby="hero-heading">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-accent/20"
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: dot.size, height: dot.size }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -20, 0] }}
            transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [45, 50, 45], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[18%] w-5 h-5 border border-accent/30 rotate-45"
        />
        <motion.div
          animate={{ y: [0, -12, 0], scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 9, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[35%] left-[8%] w-8 h-8 rounded-full border border-green/20"
        />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] right-[12%] w-2 h-2 rounded-full bg-accent/40"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(240,240,245,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(240,240,245,0.4) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-4xl"
      >
        {/* Logo icon */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-accent/30 via-accent/15 to-green/15 border-2 border-accent/25 shadow-2xl shadow-accent/20">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <circle cx="16" cy="18" r="6" stroke="#A78BFA" strokeWidth="2.5" fill="rgba(167,139,250,0.15)" />
              <circle cx="40" cy="18" r="6" stroke="#34D399" strokeWidth="2.5" fill="rgba(52,211,153,0.15)" />
              <circle cx="28" cy="40" r="6" stroke="#FBBF24" strokeWidth="2.5" fill="rgba(251,191,36,0.15)" />
              <circle cx="28" cy="22" r="3.5" fill="#A78BFA" opacity="0.8" />
              <line x1="20" y1="20" x2="24.5" y2="21" stroke="#A78BFA" strokeWidth="1.5" opacity="0.6" />
              <line x1="36" y1="20" x2="31.5" y2="21" stroke="#34D399" strokeWidth="1.5" opacity="0.6" />
              <line x1="19" y1="23" x2="25" y2="36" stroke="#FBBF24" strokeWidth="1.5" opacity="0.5" />
              <line x1="37" y1="23" x2="31" y2="36" stroke="#34D399" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-accent/20 bg-surface/50 backdrop-blur-md mb-8 shadow-lg shadow-accent/5"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
          </span>
          <span className="text-[11px] text-text-secondary font-medium tracking-widest uppercase">
            4-Agent AI Pipeline
          </span>
        </motion.div>

        {/* Title — BIG */}
        <motion.h1
          id="hero-heading"
          variants={fadeUp}
          className="font-display text-[2.5rem] md:text-[3.75rem] lg:text-[4.5rem] font-extrabold tracking-[-0.04em] leading-[1.0] mb-4"
        >
          <span className="text-text">Quorum</span>
        </motion.h1>

        {/* Tagline — smaller, elegant */}
        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl font-medium tracking-[-0.01em] mb-8"
        >
          <span className="bg-gradient-to-r from-accent via-purple-400 to-green bg-[length:200%_auto] animate-[gradient_6s_ease_infinite] bg-clip-text text-transparent">
            AI Fact-Verification Built on Trust
          </span>
        </motion.p>

        {/* Description — concise */}
        <motion.p
          variants={fadeUp}
          className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Four independent AI agents research, cross-verify, detect hallucinations, and compile citation-backed reports — each claim sourced, every score explainable.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-text-secondary/50 text-xs max-w-lg mx-auto mb-10 leading-relaxed"
        >
          Generative AI tools often struggle with hallucination. Quorum solves this by having multiple agents check and challenge each other.
        </motion.p>

        {/* Agent icons row */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 md:gap-6 mb-10">
          {agentIcons.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border backdrop-blur-sm"
                style={{ background: `${color}10`, borderColor: `${color}30` }}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color }} />
              </div>
              <span className="text-[9px] md:text-[10px] text-text-secondary/60 font-medium tracking-wider uppercase">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(124,58,237,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-9 py-4 bg-accent text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-accent/25 hover:shadow-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base overflow-hidden"
            aria-label="Start verifying a claim with Quorum's multi-agent AI fact-checking pipeline"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative">Start Fact-Checking</span>
            <ArrowRight className="w-4 h-4 relative transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}
