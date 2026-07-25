import jsPDF from 'jspdf'
import type { VerificationReport } from '../types'

export function exportReportAsPDF(report: VerificationReport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [31, 41, 55]) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(...color)

    const lines = doc.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      if (y > 270) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += fontSize * 0.5
    }
    y += 2
  }

  const addDivider = () => {
    if (y > 270) {
      doc.addPage()
      y = margin
    }
    doc.setDrawColor(200)
    doc.setLineWidth(0.2)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
  }

  // Title
  addText('Quorum Verification Report', 20, true, [124, 58, 237])
  y += 2

  // Topic
  addText(report.topic, 14, true)
  y += 2

  // Date
  addText(
    `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    10,
    false,
    [122, 122, 149]
  )
  y += 3

  addDivider()

  // Overall confidence
  const pct = Math.round((report.overall_confidence || 0) * 100)
  addText(`Overall Confidence: ${pct}%`, 24, true, pct >= 70 ? [52, 211, 153] : pct >= 40 ? [251, 191, 36] : [248, 113, 113])
  y += 3

  // Summary
  if (report.summary) {
    addText(report.summary, 10, false, [55, 65, 81])
    y += 3
  }

  addDivider()

  // Stats
  const claims = report.claims || []
  const verified = claims.filter(c => c.verification_status === 'verified').length
  const partial = claims.filter(c => c.verification_status === 'partially_verified').length
  const flagged = claims.filter(c => c.verification_status === 'unverified' || c.verification_status === 'contradicted').length

  addText(`Verified: ${verified}  |  Partial: ${partial}  |  Flagged: ${flagged}`, 10, true)
  y += 5

  addDivider()

  // Claims
  addText('Claims', 14, true, [124, 58, 237])
  y += 3

  for (let i = 0; i < claims.length; i++) {
    const c = claims[i]
    const conf = Math.round((c.confidence || 0) * 100)

    if (y > 240) {
      doc.addPage()
      y = margin
    }

    // Claim number and text
    addText(`${i + 1}. ${c.claim}`, 10, true)
    y += 1

    // Status and confidence
    const statusColor: [number, number, number] =
      c.verification_status === 'verified' ? [52, 211, 153] :
      c.verification_status === 'partially_verified' ? [251, 191, 36] :
      [248, 113, 113]

    addText(
      `Confidence: ${conf}%  |  Status: ${c.verification_status.replace('_', ' ')}`,
      9,
      false,
      statusColor
    )

    // Source
    if (c.source) {
      addText(`Source: ${c.source}`, 8, false, [122, 122, 149])
    }

    // Supporting/contradicting sources
    if (c.supporting_sources?.length) {
      addText(`Supporting: ${c.supporting_sources.join(', ')}`, 8, false, [52, 211, 153])
    }
    if (c.contradicting_sources?.length) {
      addText(`Contradicting: ${c.contradicting_sources.join(', ')}`, 8, false, [248, 113, 113])
    }

    // Reasoning
    if (c.reasoning) {
      addText(`Reasoning: ${c.reasoning}`, 8, false, [122, 122, 149])
    }

    y += 4
  }

  // Hallucination flags
  const flags = report.hallucinations?.filter(h => h.flag_type && h.flag_type !== 'none') || []
  if (flags.length > 0) {
    addDivider()
    addText('Contradiction & Hallucination Flags', 14, true, [248, 113, 113])
    y += 3

    for (const flag of flags) {
      if (y > 250) {
        doc.addPage()
        y = margin
      }

      const typeLabel = flag.flag_type === 'direct_contradiction' ? 'Direct Contradiction' : 'Unsubstantiated Claim'
      addText(`[${typeLabel}] ${flag.claim}`, 9, true, flag.flag_type === 'direct_contradiction' ? [251, 191, 36] : [248, 113, 113])
      addText(`Severity: ${flag.severity} — ${flag.reason}`, 8, false, [122, 122, 149])
      y += 3
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Quorum — Multi-Agent Fact-Verification`, margin, 290)
    doc.text(`Page ${i}/${totalPages}`, pageWidth - margin - 20, 290)
  }

  doc.save(`quorum-report-${report.topic.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`)
}
