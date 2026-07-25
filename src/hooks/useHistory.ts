import { useState, useCallback } from 'react'
import type { HistoryEntry, VerificationReport } from '../types'

const STORAGE_KEY = 'quorum_history'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())

  const saveReport = useCallback((report: VerificationReport) => {
    const verified = report.claims.filter(c => c.verification_status === 'verified').length
    const partial = report.claims.filter(c => c.verification_status === 'partially_verified').length
    const flagged = report.claims.filter(c => c.verification_status === 'unverified' || c.verification_status === 'contradicted').length

    const entry: HistoryEntry = {
      id: generateId(),
      topic: report.topic,
      overall_confidence: report.overall_confidence,
      summary: report.summary,
      claims_count: report.claims.length,
      verified_count: verified,
      partial_count: partial,
      flagged_count: flagged,
      timestamp: Date.now(),
      fullReport: report,
    }

    setHistory(prev => {
      const next = [entry, ...prev]
      saveHistory(next)
      return next
    })

    return entry.id
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id)
      saveHistory(next)
      return next
    })
  }, [])

  const getEntry = useCallback((id: string): HistoryEntry | undefined => {
    return history.find(e => e.id === id)
  }, [history])

  const stats = {
    totalReports: history.length,
    totalClaims: history.reduce((sum, e) => sum + e.claims_count, 0),
    avgConfidence: history.length > 0
      ? Math.round(history.reduce((sum, e) => sum + e.overall_confidence, 0) / history.length * 100)
      : 0,
    totalFlagged: history.reduce((sum, e) => sum + e.flagged_count, 0),
  }

  return { history, stats, saveReport, deleteEntry, getEntry }
}
