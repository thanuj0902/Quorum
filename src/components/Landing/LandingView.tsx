import { History } from 'lucide-react'
import Logo from '../ui/Logo'
import ShareMenu from '../ui/ShareMenu'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import WhyDifferent from './WhyDifferent'
import Metrics from './Metrics'
import LandingFooter from './LandingFooter'

interface LandingViewProps {
  onStart: () => void
  onHistory: () => void
}

export default function LandingView({ onStart, onHistory }: LandingViewProps) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onStart} />
          <div className="flex items-center gap-3">
            <button
              onClick={onHistory}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-secondary transition-all duration-300 hover:border-accent/30 hover:text-text"
              style={{ background: 'var(--color-surface)' }}
              aria-label="View history"
            >
              <History className="w-4 h-4" />
            </button>
            <ShareMenu />
          </div>
        </div>
      </nav>

      <main>
        <Hero onStart={onStart} />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="why-different">
          <WhyDifferent />
        </div>
        <div id="features">
          <Metrics />
        </div>
      </main>

      <LandingFooter />
    </>
  )
}
