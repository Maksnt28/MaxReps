import { describe, it, expect, vi } from 'vitest'

// Mock ErrorFallback to avoid react-native import chain
vi.mock('../ErrorFallback', () => ({
  ErrorFallback: () => null,
}))

// Import after mock
const { ErrorBoundary } = await import('../ErrorBoundary')

describe('ErrorBoundary', () => {
  it('getDerivedStateFromError returns hasError: true', () => {
    const state = ErrorBoundary.getDerivedStateFromError()
    expect(state).toEqual({ hasError: true })
  })

  it('resetError sets hasError back to false', () => {
    const instance = new ErrorBoundary({ children: null })
    instance.state = { hasError: true }

    let stateUpdate: Record<string, unknown> | null = null
    instance.setState = ((update: Record<string, unknown>) => {
      stateUpdate = update
    }) as any

    instance.resetError()
    expect(stateUpdate).toEqual({ hasError: false })
  })
})
