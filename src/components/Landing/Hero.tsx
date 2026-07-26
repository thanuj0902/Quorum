import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  onStart: () => void
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

const dots = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 4,
}))

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden" aria-labelledby="hero-heading">
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

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Diamond */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [45, 50, 45], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[18%] w-5 h-5 border border-accent/30 rotate-45"
        />
        {/* Small ring */}
        <motion.div
          animate={{ y: [0, -12, 0], scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 9, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[35%] left-[8%] w-8 h-8 rounded-full border border-green/20"
        />
        {/* Tiny filled circle */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] right-[12%] w-2 h-2 rounded-full bg-accent/40"
        />
        {/* Plus sign */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 11, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] left-[22%] text-accent/20 text-lg font-mono"
        >
          +
        </motion.div>
        {/* Triangle */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 15, 0], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 8, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[45%] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-accent/20"
        />
        {/* Small dot cluster */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`dot-cluster-${i}`}
            animate={{ y: [0, -8 - i * 3, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 5 + i, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full bg-green/25"
            style={{
              width: 3 + i,
              height: 3 + i,
              bottom: `${20 + i * 8}%`,
              left: `${70 + i * 4}%`,
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

        {/* H1 — keyword-rich, unique */}
        <motion.h1
          id="hero-heading"
          variants={fadeUp}
          className="font-display text-[2.75rem] md:text-[4.5rem] font-bold tracking-[-0.03em] leading-[1.05] mb-7"
        >
          AI Fact-Verification
          <br />
          <span className="bg-gradient-to-r from-accent via-purple-400 to-green bg-[length:200%_auto] animate-[gradient_6s_ease_infinite] bg-clip-text text-transparent">
            Built on Trust, Not Guesswork
          </span>
        </motion.h1>

        {/* Primary description — keyword-rich, 150+ words total on page */}
        <motion.p
          variants={fadeUp}
          className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto mb-5 leading-relaxed"
        >
          Quorum is a free multi-agent AI fact-verification system that uses four independent AI agents to research, cross-verify, detect hallucinations, and compile citation-backed verification reports. Every claim sourced, every score explainable.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-accent/70 text-sm max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Generative AI tools are powerful researchers but often struggle with hallucination and unverified claims. Quorum solves this by having multiple AI agents check and challenge each other — producing far more trustworthy output than a single model working alone.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-text-secondary/60 text-sm max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Built for journalists verifying breaking news, researchers validating citations, and anyone who needs to verify claims with evidence. Supports batch verification of multiple claims, shareable report links, and PDF export. No login required.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(124,58,237,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-9 py-4.5 bg-accent text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-accent/25 hover:shadow-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base overflow-hidden"
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
