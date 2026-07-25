import Logo from '../ui/Logo'
import ShareMenu from '../ui/ShareMenu'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import WhyDifferent from './WhyDifferent'
import LandingFooter from './LandingFooter'

export default function LandingView({ onStart }) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-base/80 backdrop-blur-xl border-b border-border/50" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo onClick={onStart} />
          <ShareMenu />
        </div>
      </nav>

      <main>
        <Hero onStart={onStart} />
        <HowItWorks />
        <WhyDifferent />
      </main>

      <LandingFooter />
    </>
  )
}
