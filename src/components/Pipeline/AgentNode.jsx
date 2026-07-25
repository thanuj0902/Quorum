import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const AGENT_COLORS = {
  researcher: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', glow: 'shadow-accent/10' },
  verifier: { bg: 'bg-green/10', border: 'border-green/20', text: 'text-green', glow: 'shadow-green/10' },
  contradiction: { bg: 'bg-orange/10', border: 'border-orange/20', text: 'text-orange', glow: 'shadow-orange/10' },
  synthesizer: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', glow: 'shadow-accent/10' },
}

function AgentNode({ agent, index, isActive, isDone, message, timer }) {
  const colors = useMemo(() => AGENT_COLORS[agent.id] || AGENT_COLORS.researcher, [agent.id])

  const statusText = isDone ? 'Complete' : isActive ? (message || 'Working...') : 'Waiting'
  const ariaLabel = `${agent.label} agent: ${statusText}${timer ? `, completed in ${timer}s` : ''}`

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        borderColor: isActive ? '#7C3AED' : isDone ? '#22C55E' : '#222230',
      }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`
        relative bg-surface border rounded-2xl p-5 text-center transition-all duration-500
        ${isActive ? `shadow-lg ${colors.glow}` : ''}
        ${isDone ? 'shadow-md shadow-green/5' : ''}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 rounded-2xl border border-accent/20 pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          aria-hidden="true"
        />
      )}

      <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mx-auto mb-3 transition-colors duration-300`} aria-hidden="true">
        <span className={`text-xl ${colors.text}`}>{agent.icon}</span>
      </div>

      <h4 className="font-display font-semibold text-sm mb-1.5">{agent.label}</h4>

      <motion.p
        key={message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-text-secondary font-mono min-h-[32px] flex items-center justify-center"
      >
        {isDone ? (
          <span className="text-green">Complete</span>
        ) : isActive ? (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {message || 'Working...'}
          </motion.span>
        ) : (
          <span className="text-text-secondary/40">Waiting</span>
        )}
      </motion.p>

      {timer != null && (
        <div className="text-[11px] text-text-secondary/50 font-mono mt-1.5">{timer}s</div>
      )}
    </motion.div>
  )
}

export default memo(AgentNode)
