import Logo from '../ui/Logo'
import Hero from './Hero'
import PipelinePreview from './PipelinePreview'
import HowItWorks from './HowItWorks'
import WhyDifferent from './WhyDifferent'
import LandingFooter from './LandingFooter'

export default function LandingView({ onStart }) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onStart} />
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-text-secondary/70 font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border border-border/60 bg-surface/40 backdrop-blur-sm">INNOVA HACK 2026</span>
            <span className="text-[11px] text-accent font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border border-accent/15 bg-accent/[0.06] backdrop-blur-sm">Gen AI</span>
          </div>
        </div>
      </nav>

      <main>
        <Hero onStart={onStart} />
        <PipelinePreview />
        <HowItWorks />
        <WhyDifferent />
      </main>

      <LandingFooter onStart={onStart} />
    </>
  )
}
