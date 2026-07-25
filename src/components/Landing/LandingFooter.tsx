import { memo } from 'react'

function LandingFooter() {
  return (
    <footer className="py-10 px-6 border-t border-border" role="contentinfo">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-sm font-semibold tracking-tight">Quorum</span>
          <nav aria-label="Footer navigation" className="flex items-center gap-4">
            <a href="#how-it-works" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">How It Works</a>
            <a href="#why-different" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Why Different</a>
            <a href="#features" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Features</a>
          </nav>
        </div>
        <span className="text-text-secondary/50 text-xs font-mono">
          Multi-Agent Research & Fact-Verification
        </span>
      </div>
      <div className="max-w-4xl mx-auto mt-6 pt-6 border-t border-border/50">
        <p className="text-text-secondary/30 text-xs text-center">
          Quorum is a multi-agent AI fact-verification system that uses four independent AI agents to research, cross-verify, detect hallucinations, and compile citation-backed reports. Built for researchers, journalists, and anyone who needs to verify claims with evidence.
        </p>
      </div>
    </footer>
  )
}

export default memo(LandingFooter)
