import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './components/ui/Logo'
import ErrorBoundary from './components/ui/ErrorBoundary'
import LandingView from './components/Landing/LandingView'
import PipelineView from './components/Pipeline/PipelineView'
import { usePipeline } from './hooks/usePipeline'

export default function App() {
  const [view, setView] = useState('landing')
  const { phase, pipelineState, report, error, runDemoPipeline, runLivePipeline } = usePipeline()

  const handleStart = () => {
    setView('pipeline')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => runDemoPipeline(), 500)
  }

  const handleBack = () => {
    setView('landing')
    window.scrollTo({ top: 0 })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base text-text noise-overlay">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingView onStart={handleStart} />
            </motion.div>
          ) : (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <PipelineView
                phase={phase}
                pipelineState={pipelineState}
                report={report}
                error={error}
                onBack={handleBack}
                onAnalyze={runLivePipeline}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}
