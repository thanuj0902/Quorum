import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AGENTS } from '../../data/agents'

const AGENT_COLORS = {
  researcher: { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)', text: '#A78BFA', glow: 'rgba(124,58,237,0.3)', progress: '#7C3AED' },
  verifier: { bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.25)', text: '#6EE7B7', glow: 'rgba(52,211,153,0.3)', progress: '#34D399' },
  contradiction: { bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.25)', text: '#FDBA74', glow: 'rgba(251,146,60,0.3)', progress: '#FB923C' },
  synthesizer: { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)', text: '#A78BFA', glow: 'rgba(124,58,237,0.3)', progress: '#7C3AED' },
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
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative bg-surface border rounded-2xl p-5 text-center transition-all duration-500 overflow-hidden"
      style={{
        borderColor: isActive ? colors.progress : isDone ? '#22C55E' : '#222230',
        boxShadow: isActive ? `0 0 30px ${colors.glow}, 0 4px 20px rgba(0,0,0,0.3)` : isDone ? '0 2px 12px rgba(34,197,94,0.08)' : 'none',
      }}
    >
      {/* Active pulse ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1px solid ${colors.border}` }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          aria-hidden="true"
        />
      )}

      {/* Done checkmark overlay */}
      {isDone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
          aria-hidden="true"
        >
          <span className="text-green text-[10px]">✓</span>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-500"
        style={{
          background: isActive ? colors.bg : isDone ? 'rgba(34,197,94,0.08)' : 'rgba(34,34,48,0.5)',
          border: `1px solid ${isActive ? colors.border : isDone ? 'rgba(34,197,94,0.2)' : '#222230'}`,
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
        }}
        aria-hidden="true"
      >
        <span className="text-xl" style={{ color: isActive ? colors.text : isDone ? '#34D399' : '#555' }}>
          {agent.icon}
        </span>
      </div>

      <h4 className="font-display font-semibold text-sm mb-0.5">{agent.label}</h4>
      <p className="text-[11px] text-text-secondary/50 mb-2.5">{agent.description}</p>

      <motion.p
        key={message || statusText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs font-mono min-h-[32px] flex items-center justify-center"
      >
        {isDone ? (
          <span className="text-green">Complete {timer ? `(${timer}s)` : ''}</span>
        ) : isActive ? (
          <motion.span style={{ color: colors.text }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
            {message || 'Working...'}
          </motion.span>
        ) : (
          <span className="text-text-secondary/30">Waiting</span>
        )}
      </motion.p>
    </motion.div>
  )
}

function PipelineVisualizer({ pipelineState }) {
  const { activeAgent, completedAgents, agentMessages, agentTimers, currentLog } = pipelineState

  return (
    <div className="w-full" role="region" aria-label="Agent pipeline status">
      {/* Desktop: horizontal */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-3" aria-label="Pipeline steps">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgent === agent.id
          const isDone = completedAgents.includes(agent.id)
          const isPast = completedAgents.indexOf(agent.id) < completedAgents.length - 1 || (completedAgents.length === AGENTS.length)

          return (
            <div key={agent.id} className="contents">
              <AgentNode
                agent={agent}
                index={i}
                isActive={isActive}
                isDone={isDone}
                message={agentMessages[agent.id]}
                timer={agentTimers[agent.id]}
              />
              {i < AGENTS.length - 1 && (
                <div className="flex items-center justify-center px-1" aria-hidden="true">
                  <motion.div
                    animate={{
                      background: isDone
                        ? 'linear-gradient(90deg, #22C55E, #22C55E)'
                        : isActive
                          ? `linear-gradient(90deg, ${AGENT_COLORS[agent.id].progress}, ${AGENT_COLORS[AGENTS[i + 1].id].progress}40)`
                          : 'linear-gradient(90deg, #222230, #222230)',
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-[2px] rounded-full relative"
                  >
                    {isDone && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.4)', filter: 'blur(4px)' }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-3" aria-label="Pipeline steps — vertical layout">
        {AGENTS.map((agent, i) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            index={i}
            isActive={activeAgent === agent.id}
            isDone={completedAgents.includes(agent.id)}
            message={agentMessages[agent.id]}
            timer={agentTimers[agent.id]}
          />
        ))}
      </div>

      {/* Live terminal */}
      <div
        className="mt-6 border border-border rounded-2xl overflow-hidden"
        style={{ background: '#0D0D10' }}
        role="log"
        aria-live="polite"
        aria-label="Pipeline activity log"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
          <span className="ml-3 text-[10px] text-text-secondary/40 font-mono tracking-wide">quorum ~ pipeline</span>
        </div>
        <div className="px-5 py-4 font-mono text-[13px] min-h-[56px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLog}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-text-secondary"
            >
              <span className="text-accent/60" aria-hidden="true">❯</span>{' '}
              <span>{currentLog || 'Initializing pipeline...'}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default memo(PipelineVisualizer)
