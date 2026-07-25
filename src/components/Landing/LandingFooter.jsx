import { memo } from 'react'

function LandingFooter() {
  return (
    <footer className="py-10 px-6 border-t border-border" role="contentinfo">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-sm font-semibold tracking-tight">Quorum</span>
        <span className="text-text-secondary/50 text-xs font-mono">
          Multi-Agent Research & Fact-Verification
        </span>
      </div>
    </footer>
  )
}

export default memo(LandingFooter)
