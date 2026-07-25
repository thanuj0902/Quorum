import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-dim border border-red/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-red">!</span>
            </div>
            <h2 className="font-display text-xl font-bold mb-3">Something went wrong</h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
