import { describe, it, expect } from 'vitest'

import {
  computeOverloadSuggestion,
  getWeightIncrement,
  roundToPlate,
  type SessionHistory,
} from '../overload'

// Helper to build a session with uniform sets
function makeSession(
  startedAt: string,
  sets: { weightKg: number; reps: number; rpe?: number | null }[]
): SessionHistory {
  return {
    startedAt,
    sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps, rpe: s.rpe ?? null })),
  }
}

describe('getWeightIncrement', () => {
  it('returns 5 for lower body muscles', () => {
    expect(getWeightIncrement('quads')).toBe(5)
    expect(getWeightIncrement('hamstrings')).toBe(5)
    expect(getWeightIncrement('glutes')).toBe(5)
    expect(getWeightIncrement('calves')).toBe(5)
  })

  it('returns 2.5 for upper body muscles', () => {
    expect(getWeightIncrement('chest')).toBe(2.5)
    expect(getWeightIncrement('back')).toBe(2.5)
    expect(getWeightIncrement('shoulders')).toBe(2.5)
    expect(getWeightIncrement('biceps')).toBe(2.5)
    expect(getWeightIncrement('triceps')).toBe(2.5)
  })

  it('returns 2.5 for abs (upper body classification)', () => {
    expect(getWeightIncrement('abs')).toBe(2.5)
  })

  it('returns 2.5 for unknown muscles (conservative default)', () => {
    expect(getWeightIncrement('forearms')).toBe(2.5)
    expect(getWeightIncrement('traps')).toBe(2.5)
  })
})

describe('roundToPlate', () => {
  it('rounds to nearest 2.5', () => {
    expect(roundToPlate(80)).toBe(80)
    expect(roundToPlate(81)).toBe(80)
    expect(roundToPlate(81.25)).toBe(82.5)
    expect(roundToPlate(82.5)).toBe(82.5)
  })

  it('rounds deload values correctly (e.g. 82.5 * 0.9 = 74.25 → 75)', () => {
    expect(roundToPlate(82.5 * 0.9)).toBe(75)
  })

  it('rounds 100 * 0.9 = 90 exactly', () => {
    expect(roundToPlate(100 * 0.9)).toBe(90)
  })
})

describe('computeOverloadSuggestion', () => {
  // --- Pre-validation ---

  it('returns null with fewer than 2 sessions', () => {
    const session = makeSession('2026-02-10', [{ weightKg: 80, reps: 8 }])
    expect(computeOverloadSuggestion([session], 8, 'chest')).toBeNull()
    expect(computeOverloadSuggestion([], 8, 'chest')).toBeNull()
  })

  it('returns null when gap > 30 days', () => {
    const newest = makeSession('2026-03-15', [{ weightKg: 80, reps: 8 }])
    const older = makeSession('2026-02-01', [{ weightKg: 80, reps: 8 }])
    expect(computeOverloadSuggestion([newest, older], 8, 'chest')).toBeNull()
  })

  it('returns null when either session has zero sets', () => {
    const newest = makeSession('2026-02-14', [])
    const older = makeSession('2026-02-10', [{ weightKg: 80, reps: 8 }])
    expect(computeOverloadSuggestion([newest, older], 8, 'chest')).toBeNull()

    const newest2 = makeSession('2026-02-14', [{ weightKg: 80, reps: 8 }])
    const older2 = makeSession('2026-02-10', [])
    expect(computeOverloadSuggestion([newest2, older2], 8, 'chest')).toBeNull()
  })

  // --- Tier 1: With RPE (>=80% coverage) ---

  it('suggests increase when RPE avg <=7 and all sets hit target (Tier 1)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 8, rpe: 6.5 },
      { weightKg: 80, reps: 8, rpe: 7 },
      { weightKg: 80, reps: 8, rpe: 7 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8, rpe: 6 },
      { weightKg: 80, reps: 9, rpe: 7 },
      { weightKg: 80, reps: 8, rpe: 6.5 },
    ])
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result).toEqual({
      type: 'increase',
      weight: 82.5,
      reps: 8,
      reason: expect.any(String),
    })
  })

  it('suggests deload when RPE avg >=9 in both sessions (Tier 1)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 100, reps: 5, rpe: 9.5 },
      { weightKg: 100, reps: 4, rpe: 9 },
      { weightKg: 100, reps: 3, rpe: 10 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 100, reps: 5, rpe: 9 },
      { weightKg: 100, reps: 4, rpe: 9.5 },
      { weightKg: 100, reps: 3, rpe: 9 },
    ])
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result).toEqual({
      type: 'deload',
      weight: 90,
      reps: 8,
      reason: expect.any(String),
    })
  })

  it('returns null for ambiguous RPE (Tier 1, neither increase nor deload)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 8, rpe: 8 },
      { weightKg: 80, reps: 8, rpe: 8 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8, rpe: 8 },
      { weightKg: 80, reps: 8, rpe: 8 },
    ])
    expect(computeOverloadSuggestion([newest, older], 8, 'chest')).toBeNull()
  })

  it('does not suggest increase when RPE <=7 but reps miss target (Tier 1)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 7, rpe: 6 },
      { weightKg: 80, reps: 7, rpe: 6 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8, rpe: 6 },
      { weightKg: 80, reps: 8, rpe: 6 },
    ])
    expect(computeOverloadSuggestion([newest, older], 8, 'chest')).toBeNull()
  })

  // --- Tier 2: Without RPE ---

  it('suggests increase when all sets hit target in both sessions (Tier 2)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 9 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
    ])
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result).toEqual({
      type: 'increase',
      weight: 82.5,
      reps: 8,
      reason: expect.any(String),
    })
  })

  it('suggests deload when >=50% sets miss by >=2 in both sessions (Tier 2)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 100, reps: 5 },
      { weightKg: 100, reps: 4 },
      { weightKg: 100, reps: 6 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 100, reps: 5 },
      { weightKg: 100, reps: 5 },
      { weightKg: 100, reps: 4 },
    ])
    // target = 8, reps 5 misses by 3, reps 4 misses by 4, reps 6 misses by 2
    // newest: 5 < 6 ✓, 4 < 6 ✓, 6 < 6 ✗ → 2/3 = 66% ≥ 50%
    // older: 5 < 6 ✓, 5 < 6 ✓, 4 < 6 ✓ → 3/3 = 100% ≥ 50%
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result).toEqual({
      type: 'deload',
      weight: 90,
      reps: 8,
      reason: expect.any(String),
    })
  })

  it('returns null for ambiguous reps (Tier 2, neither increase nor deload)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 7 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
    ])
    expect(computeOverloadSuggestion([newest, older], 8, 'chest')).toBeNull()
  })

  // --- Lower body increment ---

  it('uses +5 kg for lower body exercises', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 100, reps: 8 },
      { weightKg: 100, reps: 8 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 100, reps: 8 },
      { weightKg: 100, reps: 8 },
    ])
    const result = computeOverloadSuggestion([newest, older], 8, 'quads')
    expect(result).toEqual({
      type: 'increase',
      weight: 105,
      reps: 8,
      reason: expect.any(String),
    })
  })

  // --- Deload rounding ---

  it('rounds deload to nearest 2.5 (82.5 * 0.9 = 74.25 → 75)', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 82.5, reps: 5 },
      { weightKg: 82.5, reps: 4 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 82.5, reps: 5 },
      { weightKg: 82.5, reps: 4 },
    ])
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result).toEqual({
      type: 'deload',
      weight: 75,
      reps: 8,
      reason: expect.any(String),
    })
  })

  // --- Target reps: program vs implicit ---

  it('uses program-provided target reps', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 60, reps: 12 },
      { weightKg: 60, reps: 12 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 60, reps: 12 },
      { weightKg: 60, reps: 12 },
    ])
    // target = 12, all hit → increase
    const result = computeOverloadSuggestion([newest, older], 12, 'shoulders')
    expect(result?.type).toBe('increase')
    expect(result?.weight).toBe(62.5)
  })

  it('uses older session first set reps as implicit target when targetReps is null', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 60, reps: 10 },
      { weightKg: 60, reps: 10 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 60, reps: 10 },
      { weightKg: 60, reps: 10 },
    ])
    // implicit target = 10 (older session first set), all hit → increase
    const result = computeOverloadSuggestion([newest, older], null, 'back')
    expect(result?.type).toBe('increase')
    expect(result?.weight).toBe(62.5)
  })

  it('does not suggest increase when reps below implicit target', () => {
    const newest = makeSession('2026-02-14', [
      { weightKg: 60, reps: 7 },
      { weightKg: 60, reps: 7 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 60, reps: 10 },
      { weightKg: 60, reps: 9 },
    ])
    // implicit target = 10, newest reps = 7 → no increase
    expect(computeOverloadSuggestion([newest, older], null, 'back')).toBeNull()
  })

  // --- Mixed RPE coverage (< 80%) falls to Tier 2 ---

  it('falls to Tier 2 when RPE coverage < 80%', () => {
    // 4 sets total, only 2 have RPE = 50% coverage → Tier 2
    const newest = makeSession('2026-02-14', [
      { weightKg: 80, reps: 8, rpe: 6 },
      { weightKg: 80, reps: 8 },
    ])
    const older = makeSession('2026-02-10', [
      { weightKg: 80, reps: 8, rpe: 6 },
      { weightKg: 80, reps: 8 },
    ])
    // All sets hit target → Tier 2 increase
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result?.type).toBe('increase')
  })

  // --- Exact 30-day gap is allowed ---

  it('allows exactly 30 days gap', () => {
    const newest = makeSession('2026-03-12T00:00:00Z', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
    ])
    const older = makeSession('2026-02-10T00:00:00Z', [
      { weightKg: 80, reps: 8 },
      { weightKg: 80, reps: 8 },
    ])
    // 30 days exactly → should still work
    const result = computeOverloadSuggestion([newest, older], 8, 'chest')
    expect(result?.type).toBe('increase')
  })
})
