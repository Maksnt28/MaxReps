import { describe, it, expect } from 'vitest'

import { calculateMomentum } from '../momentum'
import type { SessionHistory } from '../overload'
import type { WorkoutSet } from '@/stores/useWorkoutStore'

function makeSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: Math.random().toString(),
    exerciseId: 'ex1',
    setNumber: 1,
    weightKg: null,
    reps: null,
    rpe: null,
    isWarmup: false,
    isCompleted: false,
    completedAt: null,
    ...overrides,
  }
}

function makeHistory(
  sets: { weightKg: number; reps: number }[]
): SessionHistory[] {
  return [{
    startedAt: '2026-01-10',
    sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps, rpe: null })),
  }]
}

describe('calculateMomentum', () => {
  it('returns null when no exercises have history', () => {
    const current = [{ exerciseId: 'ex1', sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })] }]
    const result = calculateMomentum(current, new Map())
    expect(result).toBeNull()
  })

  it('returns null when no working sets are completed', () => {
    const current = [{ exerciseId: 'ex1', sets: [makeSet({ weightKg: 80, reps: 8 })] }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    expect(calculateMomentum(current, lastMap)).toBeNull()
  })

  it('returns even (0%) when volume is identical', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    expect(result.percentage).toBe(0)
    expect(result.direction).toBe('even')
  })

  it('returns positive momentum when current volume is higher', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 85, reps: 8 })],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    // (85*8 - 80*8) / (80*8) = 40/640 = 6.25% → rounds to 6%
    expect(result.percentage).toBe(6)
    expect(result.direction).toBe('up')
  })

  it('returns negative momentum when current volume is lower', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 75, reps: 8 })],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    // (75*8 - 80*8) / (80*8) = -40/640 = -6.25% → rounds to -6%
    expect(result.percentage).toBe(-6)
    expect(result.direction).toBe('down')
  })

  it('compares position-matched sets only (fewer current sets)', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 10 })],
    }]
    // Last session had 3 sets
    const lastMap = new Map([['ex1', makeHistory([
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
    ])]])
    const result = calculateMomentum(current, lastMap)!
    // Only 1 set compared: (80*10 - 80*8) / (80*8) = 160/640 = 25%
    expect(result.percentage).toBe(25)
  })

  it('compares position-matched sets only (fewer last session sets)', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [
        makeSet({ isCompleted: true, weightKg: 80, reps: 8 }),
        makeSet({ isCompleted: true, weightKg: 80, reps: 8 }),
        makeSet({ isCompleted: true, weightKg: 80, reps: 8 }),
      ],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    // Only 1 set compared
    expect(result.percentage).toBe(0)
  })

  it('excludes warmup sets from current workout', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [
        makeSet({ isCompleted: true, isWarmup: true, weightKg: 60, reps: 10 }),
        makeSet({ isCompleted: true, weightKg: 80, reps: 8 }),
      ],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    expect(result.percentage).toBe(0)
  })

  it('aggregates across multiple exercises', () => {
    const current = [
      {
        exerciseId: 'ex1',
        sets: [makeSet({ isCompleted: true, weightKg: 100, reps: 5 })],
      },
      {
        exerciseId: 'ex2',
        sets: [makeSet({ isCompleted: true, weightKg: 50, reps: 10 })],
      },
    ]
    const lastMap = new Map([
      ['ex1', makeHistory([{ weightKg: 100, reps: 5 }])],
      ['ex2', makeHistory([{ weightKg: 50, reps: 10 }])],
    ])
    const result = calculateMomentum(current, lastMap)!
    // Both identical → 0%
    expect(result.percentage).toBe(0)
  })

  it('excludes new exercises with no history', () => {
    const current = [
      {
        exerciseId: 'ex1',
        sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })],
      },
      {
        exerciseId: 'new-ex',
        sets: [makeSet({ isCompleted: true, weightKg: 50, reps: 10 })],
      },
    ]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    // Only ex1 counted, identical → 0%
    expect(result.percentage).toBe(0)
  })

  it('treats null weight/reps as 0', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: null, reps: null })],
    }]
    const lastMap = new Map([['ex1', makeHistory([{ weightKg: 80, reps: 8 }])]])
    const result = calculateMomentum(current, lastMap)!
    expect(result.percentage).toBe(-100)
    expect(result.direction).toBe('down')
  })

  it('returns null when last session has empty sets for all exercises', () => {
    const current = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })],
    }]
    const lastMap = new Map([['ex1', [{ startedAt: '2026-01-10', sets: [] }]]])
    expect(calculateMomentum(current, lastMap)).toBeNull()
  })
})
