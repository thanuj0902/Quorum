import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastContainer from './components/ui/Toast'
import { ThemeProvider } from './hooks/ThemeProvider'
import { usePipeline } from './hooks/usePipeline'
import { useHistory, fetchReportFromServer } from './hooks/useHistory'
import { useToast } from './hooks/useToast'
import type { AppView, VerificationReport } from './types'

const LandingView = lazy(() => import('./components/Landing/LandingView'))
const PipelineView = lazy(() => import('./components/Pipeline/PipelineView'))
const BatchView = lazy(() => import('./components/Pipeline/BatchView'))
const HistoryView = lazy(() => import('./components/History/HistoryView'))
const ReportView = lazy(() => import('./components/History/ReportView'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-text-secondary text-xs font-mono">Loading...</span>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [serverReport, setServerReport] = useState<VerificationReport | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const { phase, pipelineState, report, error, runLivePipeline, runBatchPipeline } = usePipeline()
  const { history, stats, saveReport, deleteEntry, getEntry } = useHistory()
  const { toasts, addToast, removeToast } = useToast()
  const getEntryRef = useRef(getEntry)
  getEntryRef.current = getEntry

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setSelectedReportId(hash)
      setView('report')
      const local = getEntryRef.current(hash)
      if (!local) {
        fetchReportFromServer(hash).then(serverData => {
          if (serverData) {
            setServerReport(serverData)
          }
        })
      }
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
  }, [])

  const handleBack = useCallback(() => {
    setView('landing')
    window.scrollTo({ top: 0 })
  }, [])

  const handleCopyLink = useCallback(async () => {
    if (!selectedReportId) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}#${selectedReportId}`)
      setLinkCopied(true)
      addToast('Share link copied to clipboard', 'success')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      addToast('Failed to copy link', 'error')
    }
  }, [selectedReportId, addToast])

  const handleHistoryBack = useCallback(() => {
    setView('landing')
  }, [])

  const handleReportBack = useCallback(() => {
    setView('history')
  }, [])

  const selectedEntry = selectedReportId ? getEntry(selectedReportId) : undefined
  const activeReport = selectedEntry?.fullReport || serverReport

  return (
    <ThemeProvider>
    <ErrorBoundary>
      <div className="min-h-screen bg-base text-text noise-overlay">
        <Suspense fallback={<LoadingSpinner />}>
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
                  onOpenBatch={() => setView('batch')}
                />
              </motion.div>
            )}

            {view === 'batch' && (
              <motion.div
                key="batch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BatchView
                  onBack={() => setView('landing')}
                  onRunBatch={runBatchPipeline}
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

            {view === 'report' && activeReport && (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ReportView
                  report={activeReport}
                  onBack={handleReportBack}
                  onCopyLink={handleCopyLink}
                  linkCopied={linkCopied}
                />
              </motion.div>
            )}

            {view === 'report' && !activeReport && (
              <motion.div
                key="report-not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen flex items-center justify-center bg-base"
              >
                <div className="text-center space-y-4">
                  {serverReport === null && selectedReportId ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
                      <p className="text-text-secondary text-sm">Loading report from server...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-text-secondary text-sm">Report not found or may have been deleted.</p>
                      <button
                        onClick={() => { setView('landing'); window.location.hash = '' }}
                        className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 transition-colors"
                      >
                        Back to Home
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
    </ThemeProvider>
  )
}
