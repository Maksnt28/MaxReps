import { describe, it, expect } from 'vitest'
import { detectPRs } from '@/lib/prDetection'

describe('detectPRs', () => {
  it('marks first-ever set as PR (no history)', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 100, isWarmup: false },
    ]
    const historyMap: Record<string, number> = {} // no history

    const result = detectPRs(sets, historyMap)
    expect(result.has('ex-1:100')).toBe(true)
  })

  it('marks set exceeding historical max as PR', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 110, isWarmup: false },
    ]
    const historyMap = { 'ex-1': 100 }

    const result = detectPRs(sets, historyMap)
    expect(result.has('ex-1:110')).toBe(true)
  })

  it('does not mark set at or below historical max', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 100, isWarmup: false },
      { exerciseId: 'ex-1', weightKg: 90, isWarmup: false },
    ]
    const historyMap = { 'ex-1': 100 }

    const result = detectPRs(sets, historyMap)
    expect(result.size).toBe(0)
  })

  it('excludes warmup sets from PR detection', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 200, isWarmup: true },
    ]
    const historyMap = { 'ex-1': 100 }

    const result = detectPRs(sets, historyMap)
    expect(result.size).toBe(0)
  })

  it('excludes sets with null or zero weight', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: null, isWarmup: false },
      { exerciseId: 'ex-2', weightKg: 0, isWarmup: false },
    ]
    const historyMap: Record<string, number> = {}

    const result = detectPRs(sets, historyMap)
    expect(result.size).toBe(0)
  })

  it('marks each new high as PR but not later lower sets', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 105, isWarmup: false },
      { exerciseId: 'ex-1', weightKg: 110, isWarmup: false },
      { exerciseId: 'ex-1', weightKg: 108, isWarmup: false },
    ]
    const historyMap = { 'ex-1': 100 }

    const result = detectPRs(sets, historyMap)
    // Both 105 and 110 beat historical max of 100
    expect(result.has('ex-1:105')).toBe(true)
    expect(result.has('ex-1:110')).toBe(true)
    // 108 is below the workout max of 110 — not a new PR
    expect(result.has('ex-1:108')).toBe(false)
  })

  it('does not mark duplicate same-weight sets as PR', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 110, isWarmup: false },
      { exerciseId: 'ex-1', weightKg: 110, isWarmup: false },
    ]
    const historyMap = { 'ex-1': 100 }

    const result = detectPRs(sets, historyMap)
    // Only one PR key for 110
    expect(result.has('ex-1:110')).toBe(true)
    expect(result.size).toBe(1)
  })

  it('handles multiple exercises independently', () => {
    const sets = [
      { exerciseId: 'ex-1', weightKg: 110, isWarmup: false },
      { exerciseId: 'ex-2', weightKg: 60, isWarmup: false },
    ]
    const historyMap = { 'ex-1': 100, 'ex-2': 70 }

    const result = detectPRs(sets, historyMap)
    expect(result.has('ex-1:110')).toBe(true)  // PR for ex-1
    expect(result.has('ex-2:60')).toBe(false)   // not a PR for ex-2
  })

  it('handles empty sets array', () => {
    const result = detectPRs([], { 'ex-1': 100 })
    expect(result.size).toBe(0)
  })
})
