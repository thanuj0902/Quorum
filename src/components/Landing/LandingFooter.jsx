import { memo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

function LandingFooter({ onStart }) {
  return (
    <footer className="py-20 px-6 border-t border-border" role="contentinfo">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">See it in action</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">Run a full multi-agent verification pipeline on any topic.</p>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-accent/20 hover:shadow-accent/30 mb-8 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            aria-label="Try the fact-checking system now"
          >
            <span>Try it now</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </motion.button>
          <p className="text-text-secondary/50 text-xs font-mono tracking-wide">
            INNOVA HACK 2026 — Multi-Agent Research & Fact-Verification System
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default memo(LandingFooter)
