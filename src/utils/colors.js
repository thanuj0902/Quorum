export const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  SOURCE_HIGH: 70,
  SOURCE_MEDIUM: 40,
}

export function confidenceClasses(score) {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) {
    return { bg: 'bg-green-dim', text: 'text-green', border: 'border-green/20', gradient: 'from-green to-green/60' }
  }
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return { bg: 'bg-yellow-dim', text: 'text-yellow', border: 'border-yellow/20', gradient: 'from-yellow to-yellow/60' }
  }
  return { bg: 'bg-red-dim', text: 'text-red', border: 'border-red/20', gradient: 'from-red to-red/60' }
}

export function sourceTrustClass(trust) {
  if (trust >= CONFIDENCE_THRESHOLDS.SOURCE_HIGH) return 'text-green'
  if (trust >= CONFIDENCE_THRESHOLDS.SOURCE_MEDIUM) return 'text-yellow'
  return 'text-red'
}
