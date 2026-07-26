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
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 via-accent/10 to-green/10 border border-accent/25 flex items-center justify-center shadow-lg shadow-accent/15" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
            <circle cx="12" cy="14" r="4" stroke="#A78BFA" strokeWidth="2.5" fill="rgba(167,139,250,0.2)" />
            <circle cx="28" cy="14" r="4" stroke="#34D399" strokeWidth="2.5" fill="rgba(52,211,153,0.2)" />
            <circle cx="20" cy="28" r="4" stroke="#FBBF24" strokeWidth="2.5" fill="rgba(251,191,36,0.2)" />
            <circle cx="20" cy="18" r="2.5" fill="#A78BFA" opacity="0.8" />
            <line x1="15" y1="16" x2="17.5" y2="17" stroke="#A78BFA" strokeWidth="1.2" opacity="0.5" />
            <line x1="25" y1="16" x2="22.5" y2="17" stroke="#34D399" strokeWidth="1.2" opacity="0.5" />
            <line x1="14" y1="18" x2="18" y2="25" stroke="#FBBF24" strokeWidth="1.2" opacity="0.4" />
            <line x1="26" y1="18" x2="22" y2="25" stroke="#34D399" strokeWidth="1.2" opacity="0.4" />
          </svg>
        </div>
      </div>
      <span className="font-display font-semibold text-[15px] tracking-tight">
        Quorum
      </span>
    </button>
  )
}

export default memo(Logo)
