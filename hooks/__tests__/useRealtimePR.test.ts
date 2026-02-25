import { describe, it, expect } from 'vitest'

import type { ActiveExercise, WorkoutSet } from '@/stores/useWorkoutStore'

// Test the PR detection logic directly (extracted from the hook's useMemo)
// The hook wraps this in React Query + useMemo, but the core logic is testable as a pure function.

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

interface PRState {
  isPR: boolean
  previousMax: number
  newMax: number
  delta: number
}

/**
 * Pure extraction of the PR detection logic from useRealtimePR.
 * Mirrors the useMemo computation inside the hook.
 */
function computePRStates(
  exercises: { exerciseId: string; sets: WorkoutSet[] }[],
  historicalMaxes: Map<string, number>
): Map<string, PRState | null> {
  const result = new Map<string, PRState | null>()

  for (const exercise of exercises) {
    const exId = exercise.exerciseId

    if (!historicalMaxes.has(exId)) {
      result.set(exId, null)
      continue
    }

    const historicalMax = historicalMaxes.get(exId)!

    let currentMax = 0
    for (const set of exercise.sets) {
      if (set.isWarmup || !set.isCompleted || set.weightKg == null) continue
      if (set.weightKg > currentMax) currentMax = set.weightKg
    }

    if (currentMax > historicalMax) {
      result.set(exId, {
        isPR: true,
        previousMax: historicalMax,
        newMax: currentMax,
        delta: currentMax - historicalMax,
      })
    } else {
      result.set(exId, {
        isPR: false,
        previousMax: historicalMax,
        newMax: currentMax,
        delta: 0,
      })
    }
  }

  return result
}

describe('PR detection logic', () => {
  it('detects a new PR when current weight exceeds historical max', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 85, reps: 8 })],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')).toEqual({
      isPR: true,
      previousMax: 80,
      newMax: 85,
      delta: 5,
    })
  })

  it('returns isPR=false when current weight equals historical max', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.isPR).toBe(false)
  })

  it('returns isPR=false when current weight is below historical max', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 75, reps: 8 })],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.isPR).toBe(false)
  })

  it('first-ever weight is a PR (historical max = 0)', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 60, reps: 10 })],
    }]
    const maxes = new Map([['ex1', 0]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')).toEqual({
      isPR: true,
      previousMax: 0,
      newMax: 60,
      delta: 60,
    })
  })

  it('picks highest completed set for PR comparison (multiple PRs same exercise)', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [
        makeSet({ isCompleted: true, weightKg: 85, reps: 8 }),
        makeSet({ isCompleted: true, weightKg: 90, reps: 5 }),
        makeSet({ isCompleted: true, weightKg: 82, reps: 8 }),
      ],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.newMax).toBe(90)
    expect(result.get('ex1')!.delta).toBe(10)
  })

  it('excludes warmup sets from PR calculation', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [
        makeSet({ isCompleted: true, isWarmup: true, weightKg: 100, reps: 3 }),
        makeSet({ isCompleted: true, weightKg: 75, reps: 8 }),
      ],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    // Warmup 100kg excluded, working set 75kg < historical 80kg
    expect(result.get('ex1')!.isPR).toBe(false)
  })

  it('excludes incomplete sets from PR calculation', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [
        makeSet({ isCompleted: false, weightKg: 100, reps: 8 }),
        makeSet({ isCompleted: true, weightKg: 75, reps: 8 }),
      ],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.isPR).toBe(false)
  })

  it('returns null for exercise with no historical data (pending fetch)', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: 80, reps: 8 })],
    }]
    const maxes = new Map<string, number>() // empty — no data yet
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')).toBeNull()
  })

  it('handles multiple exercises independently', () => {
    const exercises = [
      {
        exerciseId: 'ex1',
        sets: [makeSet({ isCompleted: true, weightKg: 85, reps: 8 })],
      },
      {
        exerciseId: 'ex2',
        sets: [makeSet({ isCompleted: true, weightKg: 50, reps: 10 })],
      },
    ]
    const maxes = new Map([['ex1', 80], ['ex2', 60]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.isPR).toBe(true)
    expect(result.get('ex2')!.isPR).toBe(false)
  })

  it('handles null weightKg (treats as 0)', () => {
    const exercises = [{
      exerciseId: 'ex1',
      sets: [makeSet({ isCompleted: true, weightKg: null, reps: 8 })],
    }]
    const maxes = new Map([['ex1', 80]])
    const result = computePRStates(exercises, maxes)
    expect(result.get('ex1')!.isPR).toBe(false)
    expect(result.get('ex1')!.newMax).toBe(0)
  })
})
