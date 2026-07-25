import { memo, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AGENTS, PIPELINE_TIMING } from '../../data/agents'

const PREVIEW_LOGS = [
  { agent: 'researcher', text: 'Researcher found 6 claims from 4 sources' },
  { agent: 'verifier', text: 'Verifier checking claim 3 of 6...' },
  { agent: 'contradiction', text: 'Contradiction detected between Source A and Source C' },
  { agent: 'synthesizer', text: 'Synthesizer assigning confidence scores...' },
  { agent: 'synthesizer', text: 'Report complete — 4/6 claims verified' },
]

const DOT_COLORS = {
  researcher: 'bg-accent',
  verifier: 'bg-green',
  contradiction: 'bg-orange',
  synthesizer: 'bg-accent',
}

function PipelinePreview() {
  const [activeIdx, setActiveIdx] = useState(-1)
  const [logIdx, setLogIdx] = useState(0)
  const resetTimerRef = useRef(null)

  useEffect(() => {
    const agentTimer = setInterval(() => {
      setActiveIdx(prev => {
        if (prev >= AGENTS.length - 1) {
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
          resetTimerRef.current = setTimeout(() => {
            setActiveIdx(-1)
            setLogIdx(0)
          }, PIPELINE_TIMING.PREVIEW_RESET_DELAY)
          return prev
        }
        return prev + 1
      })
    }, PIPELINE_TIMING.PREVIEW_AGENT_INTERVAL)
    return () => {
      clearInterval(agentTimer)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const logTimer = setInterval(() => {
      setLogIdx(prev => (prev + 1) % PREVIEW_LOGS.length)
    }, PIPELINE_TIMING.PREVIEW_LOG_INTERVAL)
    return () => clearInterval(logTimer)
  }, [])

  const currentLog = PREVIEW_LOGS[logIdx]

  return (
    <section className="py-28 px-6" aria-label="Live pipeline preview">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">Live Pipeline</p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight">
            Watch agents work in real time
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative bg-surface border border-border rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/20"
          role="img"
          aria-label="Animated demonstration of the 4-agent research pipeline"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

          {/* Terminal header */}
          <div className="flex items-center gap-2.5 mb-8 pb-5 border-b border-border/60" aria-hidden="true">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <span className="ml-4 text-[11px] text-text-secondary/60 font-mono tracking-wide">agent-pipeline</span>
          </div>

          {/* Agent nodes */}
          <div className="flex items-center justify-between gap-3 mb-8" aria-hidden="true">
            {AGENTS.map((agent, i) => {
              const isActive = i <= activeIdx
              const isCurrent = i === activeIdx
              return (
                <div key={agent.id} className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={{
                      borderColor: isCurrent ? 'rgba(124,58,237,0.6)' : isActive ? 'rgba(124,58,237,0.25)' : 'rgba(34,34,48,0.6)',
                      boxShadow: isCurrent ? '0 0 30px rgba(124,58,237,0.15)' : 'none',
                    }}
                    className="flex-1 bg-surface-2 border border-border rounded-2xl p-5 text-center"
                  >
                    <div className="text-2xl mb-2 opacity-70">{agent.icon}</div>
                    <div className="text-xs font-semibold mb-1.5">{agent.label}</div>
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0.3 }}
                      className="text-[11px] text-text-secondary font-mono"
                    >
                      {isActive ? (isCurrent ? agent.status : 'Done') : 'Waiting'}
                    </motion.div>
                  </motion.div>
                  {i < AGENTS.length - 1 && (
                    <motion.div
                      animate={{ color: isActive ? 'rgba(124,58,237,0.6)' : 'rgba(34,34,48,0.6)' }}
                      className="text-lg shrink-0 font-light"
                    >
                      →
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Live log */}
          <div className="bg-base/80 rounded-2xl p-5 font-mono text-sm min-h-[64px] flex items-center border border-border/40">
            <motion.div
              key={logIdx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <span className={`w-2 h-2 rounded-full ${DOT_COLORS[currentLog.agent]} shrink-0`} />
              <span className="text-text-secondary">
                <span className="text-accent">$</span> {currentLog.text}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default memo(PipelinePreview)
