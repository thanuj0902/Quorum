import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ErrorBoundary from './components/ui/ErrorBoundary'
import LandingView from './components/Landing/LandingView'
import PipelineView from './components/Pipeline/PipelineView'
import HistoryView from './components/History/HistoryView'
import ReportView from './components/History/ReportView'
import ToastContainer from './components/ui/Toast'
import { usePipeline } from './hooks/usePipeline'
import { useHistory } from './hooks/useHistory'
import { useToast } from './hooks/useToast'
import type { AppView } from './types'

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const { phase, pipelineState, report, error, runDemoPipeline, runLivePipeline } = usePipeline()
  const { history, stats, saveReport, deleteEntry, getEntry } = useHistory()
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setSelectedReportId(hash)
      setView('report')
    }
  }, [])

  useEffect(() => {
    if (phase === 'complete' && report) {
      saveReport(report)
    }
  }, [phase, report, saveReport])

  const handleStart = useCallback(() => {
    setView('pipeline')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => runDemoPipeline(), 500)
  }, [runDemoPipeline])

  const handleBack = useCallback(() => {
    setView('landing')
    window.scrollTo({ top: 0 })
  }, [])

  const handleCopyLink = useCallback(async () => {
    if (!selectedReportId) return
    await navigator.clipboard.writeText(`${window.location.origin}#${selectedReportId}`)
    setLinkCopied(true)
    addToast('Share link copied to clipboard', 'success')
    setTimeout(() => setLinkCopied(false), 2000)
  }, [selectedReportId, addToast])

  const handleHistoryBack = useCallback(() => {
    setView('landing')
  }, [])

  const handleReportBack = useCallback(() => {
    setView('history')
  }, [])

  const selectedEntry = selectedReportId ? getEntry(selectedReportId) : undefined

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base text-text noise-overlay">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingView onStart={handleStart} onHistory={() => setView('history')} />
            </motion.div>
          )}

          {view === 'pipeline' && (
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
                onSaveReport={() => {
                  if (report) {
                    const id = saveReport(report)
                    addToast('Report saved to history', 'success')
                    return id
                  }
                }}
                onViewHistory={() => setView('history')}
              />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryView
                history={history}
                stats={stats}
                onSelect={(id) => {
                  setSelectedReportId(id)
                  setView('report')
                }}
                onDelete={deleteEntry}
                onBack={handleHistoryBack}
              />
            </motion.div>
          )}

          {view === 'report' && selectedEntry && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ReportView
                report={selectedEntry.fullReport}
                onBack={handleReportBack}
                onCopyLink={handleCopyLink}
                linkCopied={linkCopied}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  )
}
