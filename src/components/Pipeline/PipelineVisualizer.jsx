import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AGENTS } from '../../data/agents'
import AgentNode from './AgentNode'

function PipelineVisualizer({ pipelineState }) {
  const { activeAgent, completedAgents, agentMessages, agentTimers, currentLog } = pipelineState

  return (
    <div className="w-full" role="region" aria-label="Agent pipeline status">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center gap-3" aria-label="Pipeline steps — horizontal layout">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgent === agent.id
          const isDone = completedAgents.includes(agent.id)
          return (
            <div key={agent.id} className="flex items-center gap-3 flex-1">
              <AgentNode
                agent={agent}
                index={i}
                isActive={isActive}
                isDone={isDone}
                message={agentMessages[agent.id]}
                timer={agentTimers[agent.id]}
              />
              {i < AGENTS.length - 1 && (
                <motion.div
                  animate={{
                    color: isDone ? '#22C55E' : isActive ? '#7C3AED' : '#2a2a35',
                    scale: isActive ? 1.2 : 1,
                  }}
                  className="text-xl shrink-0 font-light"
                  aria-hidden="true"
                >
                  →
                </motion.div>
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

      {/* Live log terminal */}
      <div
        className="mt-6 bg-surface border border-border rounded-2xl overflow-hidden"
        role="log"
        aria-live="polite"
        aria-label="Pipeline activity log"
      >
        {/* Terminal dots */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]/60" />
          <span className="ml-3 text-[10px] text-text-secondary/40 font-mono tracking-wide">pipeline.log</span>
        </div>
        <div className="px-5 py-4 font-mono text-sm min-h-[52px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLog}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-text-secondary"
            >
              <span className="text-accent/70" aria-hidden="true">$</span>{' '}
              <span>{currentLog || 'Initializing pipeline...'}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default memo(PipelineVisualizer)
