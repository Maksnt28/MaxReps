import React from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console — Sentry integration point for Phase 3
    console.error('ErrorBoundary caught:', error, errorInfo.componentStack)
  }

  resetError = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback resetError={this.resetError} />
    }
    return this.props.children
  }
}
