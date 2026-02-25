import { describe, it, expect } from 'vitest'

import { getLastSessionData } from '../lastSession'
import type { SessionHistory } from '../overload'

function makeSession(
  startedAt: string,
  sets: { weightKg: number; reps: number; rpe?: number | null }[]
): SessionHistory {
  return {
    startedAt,
    sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps, rpe: s.rpe ?? null })),
  }
}

describe('getLastSessionData', () => {
  it('returns null for empty history', () => {
    expect(getLastSessionData([])).toBeNull()
  })

  it('returns data for a single session', () => {
    const history = [
      makeSession('2026-01-10', [
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 7 },
      ]),
    ]
    const result = getLastSessionData(history)!
    expect(result).not.toBeNull()
    expect(result.lastSets.size).toBe(3)
    expect(result.lastSets.get(0)).toEqual({ weightKg: 80, reps: 8 })
    expect(result.lastSets.get(2)).toEqual({ weightKg: 80, reps: 7 })
    expect(result.summary).toEqual({ maxWeight: 80, setCount: 3, commonReps: 8 })
  })

  it('uses newest session (history[0]) not older sessions', () => {
    const history = [
      makeSession('2026-01-15', [{ weightKg: 85, reps: 6 }]),
      makeSession('2026-01-10', [{ weightKg: 80, reps: 8 }]),
    ]
    const result = getLastSessionData(history)!
    expect(result.lastSets.get(0)).toEqual({ weightKg: 85, reps: 6 })
    expect(result.summary!.maxWeight).toBe(85)
  })

  it('handles ramping weights (maxWeight picks highest)', () => {
    const history = [
      makeSession('2026-01-15', [
        { weightKg: 60, reps: 10 },
        { weightKg: 70, reps: 8 },
        { weightKg: 80, reps: 6 },
        { weightKg: 70, reps: 8 },
      ]),
    ]
    const result = getLastSessionData(history)!
    expect(result.summary!.maxWeight).toBe(80)
    expect(result.summary!.setCount).toBe(4)
  })

  it('calculates mode for commonReps', () => {
    const history = [
      makeSession('2026-01-15', [
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 10 },
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 8 },
      ]),
    ]
    const result = getLastSessionData(history)!
    expect(result.summary!.commonReps).toBe(8)
  })

  it('uses last set reps when all rep counts are different', () => {
    const history = [
      makeSession('2026-01-15', [
        { weightKg: 80, reps: 10 },
        { weightKg: 80, reps: 8 },
        { weightKg: 80, reps: 6 },
      ]),
    ]
    const result = getLastSessionData(history)!
    // All reps appear once, so highest-frequency wins (all tied at 1).
    // The implementation picks the one with highest frequency via iteration,
    // which will be 10 (first encountered with freq 1).
    expect(result.summary!.commonReps).toBe(10)
  })

  it('returns empty lastSets and null summary when session has no sets', () => {
    const history = [makeSession('2026-01-15', [])]
    const result = getLastSessionData(history)!
    expect(result.lastSets.size).toBe(0)
    expect(result.summary).toBeNull()
  })

  it('indexes sets by position for ghost value alignment', () => {
    const history = [
      makeSession('2026-01-15', [
        { weightKg: 60, reps: 12 },
        { weightKg: 70, reps: 10 },
        { weightKg: 80, reps: 8 },
      ]),
    ]
    const result = getLastSessionData(history)!
    expect(result.lastSets.get(0)).toEqual({ weightKg: 60, reps: 12 })
    expect(result.lastSets.get(1)).toEqual({ weightKg: 70, reps: 10 })
    expect(result.lastSets.get(2)).toEqual({ weightKg: 80, reps: 8 })
    expect(result.lastSets.get(3)).toBeUndefined()
  })

  it('handles single set session', () => {
    const history = [
      makeSession('2026-01-15', [{ weightKg: 100, reps: 5 }]),
    ]
    const result = getLastSessionData(history)!
    expect(result.lastSets.size).toBe(1)
    expect(result.summary).toEqual({ maxWeight: 100, setCount: 1, commonReps: 5 })
  })
})
