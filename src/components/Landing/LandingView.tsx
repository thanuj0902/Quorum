import { History } from 'lucide-react'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import ShareMenu from '../ui/ShareMenu'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import WhyDifferent from './WhyDifferent'
import Metrics from './Metrics'
import UseCases from './UseCases'
import FAQ from './FAQ'
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
            <div className="hidden md:flex items-center gap-4 mr-2">
              <a href="#how-it-works" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">How It Works</a>
              <a href="#features" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Features</a>
              <a href="#use-cases" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">Use Cases</a>
              <a href="#faq" className="text-text-secondary/50 text-xs hover:text-text-secondary transition-colors">FAQ</a>
            </div>
            <ThemeToggle />
            <button
              onClick={onHistory}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-secondary transition-all duration-300 hover:border-accent/30 hover:text-text"
              style={{ background: 'var(--color-surface)' }}
              aria-label="View verification history"
            >
              <History className="w-4 h-4" />
            </button>
            <ShareMenu />
          </div>
        </div>
      </nav>

      <main id="main-content">
        <Hero onStart={onStart} />
        <HowItWorks />
        <WhyDifferent />
        <Metrics />
        <UseCases />
        <FAQ />
      </main>

      <LandingFooter />
    </>
  )
}
