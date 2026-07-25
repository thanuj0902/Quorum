import { memo } from 'react'

function LandingFooter() {
  return (
    <footer className="py-10 px-6 border-t border-border" role="contentinfo">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          <div>
            <span className="font-display text-sm font-semibold tracking-tight">Quorum</span>
            <p className="text-text-secondary/40 text-xs mt-2 max-w-xs leading-relaxed">
              Multi-agent AI fact-verification system using four independent agents for reliable, transparent, and explainable results.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <nav aria-label="Product navigation">
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">How It Works</a></li>
                <li><a href="#why-different" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Why Different</a></li>
                <li><a href="#features" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Features</a></li>
                <li><a href="#use-cases" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Use Cases</a></li>
                <li><a href="#faq" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <nav aria-label="Resources navigation">
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com/thanuj0902/Quorum" target="_blank" rel="noopener noreferrer" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">GitHub Repository</a></li>
                <li><a href="https://github.com/thanuj0902/Quorum#readme" target="_blank" rel="noopener noreferrer" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Documentation</a></li>
                <li><a href="https://github.com/thanuj0902/Quorum/issues" target="_blank" rel="noopener noreferrer" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Report Issues</a></li>
              </ul>
            </nav>

            <nav aria-label="Features navigation">
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Features</h4>
              <ul className="space-y-2">
                <li><span className="text-text-secondary/50 text-xs">Multi-Agent Verification</span></li>
                <li><span className="text-text-secondary/50 text-xs">Hallucination Detection</span></li>
                <li><span className="text-text-secondary/50 text-xs">Batch Claim Verification</span></li>
                <li><span className="text-text-secondary/50 text-xs">Shareable Reports</span></li>
                <li><span className="text-text-secondary/50 text-xs">PDF Export</span></li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-text-secondary/30 text-xs font-mono">
              &copy; {new Date().getFullYear()} Quorum. Open-source multi-agent AI fact-verification.
            </span>
            <span className="text-text-secondary/30 text-xs">
              Built with TypeScript, React, FastAPI, and Anthropic Claude
            </span>
          </div>
          <p className="text-text-secondary/20 text-[11px] text-center mt-4 leading-relaxed max-w-2xl mx-auto">
            Quorum is a free, open-source multi-agent AI fact-verification system that uses four independent AI agents — Research, Verification, Hallucination Detection, and Synthesis — to verify claims with citation-backed evidence. Every claim is sourced, every confidence score is explainable, and every report is shareable.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default memo(LandingFooter)
