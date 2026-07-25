import { memo } from 'react'

function Logo({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 hover:opacity-80 transition-opacity ${className}`}
      aria-label="Quorum — return to home"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20" aria-hidden="true">
        <span className="text-white text-xs font-bold font-mono">Q</span>
      </div>
      <span className="font-display font-semibold text-[15px] tracking-tight">
        Quorum
      </span>
    </button>
  )
}

export default memo(Logo)
