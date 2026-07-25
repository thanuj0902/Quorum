import type { VerificationReport } from '../types'

export function exportReportAsPDF(report: VerificationReport): void {
  const pct = Math.round((report.overall_confidence || 0) * 100)
  const claims = report.claims || []

  const verified = claims.filter(c => c.verification_status === 'verified').length
  const partial = claims.filter(c => c.verification_status === 'partially_verified').length
  const flagged = claims.filter(c => c.verification_status === 'unverified' || c.verification_status === 'contradicted').length

  const claimRows = claims.map(c => {
    const conf = Math.round((c.confidence || 0) * 100)
    return `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px">
        <p style="font-weight:600;margin:0 0 8px 0">${c.claim}</p>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;padding:2px 8px;border-radius:4px;background:#f3f4f6">${conf}%</span>
          <span style="font-size:12px;padding:2px 8px;border-radius:4px;background:#f3f4f6;text-transform:capitalize">${c.verification_status.replace('_', ' ')}</span>
        </div>
        <p style="font-size:12px;color:#6b7280;margin:0"><strong>Source:</strong> ${c.source}</p>
        ${c.reasoning ? `<p style="font-size:12px;color:#6b7280;margin:8px 0 0 0"><strong>Reasoning:</strong> ${c.reasoning}</p>` : ''}
      </div>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <title>FactCheck Report — ${report.topic}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
    .score { font-size: 48px; font-weight: bold; margin-bottom: 8px; }
    .summary { font-size: 14px; line-height: 1.6; margin-bottom: 24px; color: #374151; }
    .claims-header { font-size: 18px; font-weight: 600; margin: 24px 0 12px; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { padding: 8px 16px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 13px; }
    @media print { body { padding: 20px; } }
  </style>
</head><body>
  <h1>${report.topic}</h1>
  <p class="meta">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <div class="score">${pct}%</div>
  <p style="font-size:13px;color:#6b7280;margin-bottom:16px">Overall Confidence</p>
  <div class="stats">
    <div class="stat"><strong>${verified}</strong> Verified</div>
    <div class="stat"><strong>${partial}</strong> Partial</div>
    <div class="stat"><strong>${flagged}</strong> Flagged</div>
  </div>
  <p class="summary">${report.summary}</p>
  <div class="claims-header">Claims (${claims.length})</div>
  ${claimRows}
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      win.print()
      URL.revokeObjectURL(url)
    }
  }
}
