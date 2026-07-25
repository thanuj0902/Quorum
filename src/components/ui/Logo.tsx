import { memo } from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  onClick?: () => void
  className?: string
}

function Logo({ onClick, className = '' }: LogoProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 hover:opacity-80 transition-opacity relative ${className}`}
      aria-label="Quorum — return to home"
    >
      <div className="relative">
        {/* Floating glow behind logo */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-xl bg-accent/30 blur-md"
          aria-hidden="true"
        />
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20" aria-hidden="true">
          <span className="text-white text-xs font-bold font-mono">Q</span>
        </div>
      </div>
      <span className="font-display font-semibold text-[15px] tracking-tight">
        Quorum
      </span>
    </button>
  )
}

export default memo(Logo)
