import { describe, it, expect } from 'vitest'

// Test ProgressRing's clamping logic directly
// (The component uses react-native-svg which can't be rendered in vitest,
//  so we test the pure math that the component applies)
describe('ProgressRing clamp logic', () => {
  const size = 15
  const strokeWidth = 1.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  function computeStrokeDashoffset(progress: number): number {
    const clampedProgress = Math.max(0, Math.min(1, progress))
    return circumference * (1 - clampedProgress)
  }

  it('progress > 1 is clamped to 1 (fully filled)', () => {
    const offset = computeStrokeDashoffset(1.5)
    expect(offset).toBe(0) // Fully filled = 0 offset
  })

  it('progress < 0 is clamped to 0 (fully empty)', () => {
    const offset = computeStrokeDashoffset(-0.5)
    expect(offset).toBeCloseTo(circumference) // Fully empty = full circumference offset
  })

  it('progress = 0.5 gives half-filled ring', () => {
    const offset = computeStrokeDashoffset(0.5)
    expect(offset).toBeCloseTo(circumference * 0.5)
  })

  it('progress = 1 gives fully filled ring', () => {
    const offset = computeStrokeDashoffset(1)
    expect(offset).toBe(0)
  })

  it('progress = 0 gives fully empty ring', () => {
    const offset = computeStrokeDashoffset(0)
    expect(offset).toBeCloseTo(circumference)
  })
})
