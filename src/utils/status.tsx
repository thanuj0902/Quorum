import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Claim } from '../types'

export function statusIcon(status: Claim['verification_status']) {
  switch (status) {
    case 'verified': return <CheckCircle2 className="w-4 h-4 text-green" aria-hidden="true" />
    case 'partially_verified': return <AlertTriangle className="w-4 h-4 text-yellow" aria-hidden="true" />
    case 'unverified': return <XCircle className="w-4 h-4 text-text-secondary" aria-hidden="true" />
    case 'contradicted': return <XCircle className="w-4 h-4 text-red" aria-hidden="true" />
  }
}

export function statusLabel(status: Claim['verification_status']): { text: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'verified': return { text: 'Verified', color: '#34D399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' }
    case 'partially_verified': return { text: 'Partial', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' }
    case 'unverified': return { text: 'Unverified', color: '#7A7A95', bg: 'rgba(122,122,149,0.08)', border: 'rgba(122,122,149,0.2)' }
    case 'contradicted': return { text: 'Contradicted', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' }
  }
}
