import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const dots = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 4,
}))

export default function Hero({ onStart }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
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
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)' }}
        />
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full bg-accent/20"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
            }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -20, 0] }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
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
        className="relative z-10 text-center max-w-3xl"
      >
        {/* Floating badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-surface/60 backdrop-blur-md mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
          </span>
          <span className="text-xs text-text-secondary font-medium tracking-wide uppercase">
            Multi-Agent Pipeline
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-[2.75rem] md:text-[4.5rem] font-bold tracking-[-0.03em] leading-[1.05] mb-7"
        >
          Every claim, sourced.
          <br />
          <span className="bg-gradient-to-r from-accent via-purple-400 to-green bg-[length:200%_auto] animate-[gradient_6s_ease_infinite] bg-clip-text text-transparent">
            Every score, explainable.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="text-text-secondary text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Four AI agents research, cross-verify, and fact-check any topic — then show their work.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(124,58,237,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-9 py-4.5 bg-accent text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-accent/25 hover:shadow-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base overflow-hidden"
            aria-label="Watch the multi-agent pipeline verify a claim"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative">Watch it verify a claim</span>
            <ArrowRight className="w-4 h-4 relative transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}
