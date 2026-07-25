import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero({ onStart }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[20%] w-[450px] h-[450px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -40, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(240,240,245,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(240,240,245,0.4) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-3xl"
      >
        <h1 className="font-display text-[2.75rem] md:text-[4.5rem] font-bold tracking-[-0.03em] leading-[1.05] mb-7">
          Every claim, sourced.
          <br />
          <span className="bg-gradient-to-r from-accent via-purple-400 to-accent bg-[length:200%_auto] animate-[gradient_6s_ease_infinite] bg-clip-text text-transparent">
            Every score, explainable.
          </span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed">
          Four AI agents research, cross-verify, and fact-check any topic — then show their work.
        </p>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-accent/20 hover:shadow-accent/30 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base"
          aria-label="Watch the multi-agent pipeline verify a claim"
        >
          <span>Watch it verify a claim</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </section>
  )
}
