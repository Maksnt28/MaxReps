import { describe, it, expect } from 'vitest'

// Test the pure grouping/mapping logic used by useWorkoutSession

interface MockSet {
  id: string
  exercise_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  rpe: number | null
  is_warmup: boolean
  is_pr: boolean
  completed_at: string | null
  exercises: { name_en: string; name_fr: string } | null
}

interface SessionExercise {
  exerciseId: string
  nameEn: string
  nameFr: string
  sets: {
    id: string
    setNumber: number
    weightKg: number | null
    reps: number | null
    rpe: number | null
    isWarmup: boolean
    isPr: boolean
  }[]
}

function groupSetsIntoExercises(sets: MockSet[]): SessionExercise[] {
  const exerciseMap = new Map<string, SessionExercise>()
  for (const set of sets) {
    const exId = set.exercise_id
    if (!exerciseMap.has(exId)) {
      const joined = set.exercises
      exerciseMap.set(exId, {
        exerciseId: exId,
        nameEn: joined?.name_en ?? exId,
        nameFr: joined?.name_fr ?? joined?.name_en ?? exId,
        sets: [],
      })
    }
    exerciseMap.get(exId)!.sets.push({
      id: set.id,
      setNumber: set.set_number,
      weightKg: set.weight_kg != null ? Number(set.weight_kg) : null,
      reps: set.reps,
      rpe: set.rpe != null ? Number(set.rpe) : null,
      isWarmup: set.is_warmup,
      isPr: set.is_pr,
    })
  }

  // Sort sets within each exercise by set_number
  for (const exercise of exerciseMap.values()) {
    exercise.sets.sort((a, b) => a.setNumber - b.setNumber)
  }

  return [...exerciseMap.values()]
}

describe('useWorkoutSession — grouping logic', () => {
  it('groups sets by exercise with correct ordering', () => {
    const sets: MockSet[] = [
      { id: 'set1', exercise_id: 'ex1', set_number: 1, weight_kg: 100, reps: 8, rpe: 8, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:00:00Z', exercises: { name_en: 'Bench Press', name_fr: 'Développé couché' } },
      { id: 'set2', exercise_id: 'ex1', set_number: 2, weight_kg: 100, reps: 6, rpe: 9, is_warmup: false, is_pr: true, completed_at: '2026-02-24T10:02:00Z', exercises: { name_en: 'Bench Press', name_fr: 'Développé couché' } },
      { id: 'set3', exercise_id: 'ex2', set_number: 1, weight_kg: 60, reps: 12, rpe: null, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:05:00Z', exercises: { name_en: 'Overhead Press', name_fr: 'Développé militaire' } },
    ]

    const result = groupSetsIntoExercises(sets)
    expect(result).toHaveLength(2)
    expect(result[0].exerciseId).toBe('ex1')
    expect(result[0].nameEn).toBe('Bench Press')
    expect(result[0].nameFr).toBe('Développé couché')
    expect(result[0].sets).toHaveLength(2)
    expect(result[0].sets[0].setNumber).toBe(1)
    expect(result[0].sets[1].setNumber).toBe(2)
    expect(result[1].exerciseId).toBe('ex2')
  })

  it('handles mixed warmup and working sets', () => {
    const sets: MockSet[] = [
      { id: 'w1', exercise_id: 'ex1', set_number: 1, weight_kg: 40, reps: 10, rpe: null, is_warmup: true, is_pr: false, completed_at: '2026-02-24T10:00:00Z', exercises: { name_en: 'Squat', name_fr: 'Squat' } },
      { id: 's1', exercise_id: 'ex1', set_number: 2, weight_kg: 120, reps: 5, rpe: 8, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:03:00Z', exercises: { name_en: 'Squat', name_fr: 'Squat' } },
      { id: 's2', exercise_id: 'ex1', set_number: 3, weight_kg: 120, reps: 5, rpe: 9, is_warmup: false, is_pr: true, completed_at: '2026-02-24T10:06:00Z', exercises: { name_en: 'Squat', name_fr: 'Squat' } },
    ]

    const result = groupSetsIntoExercises(sets)
    expect(result).toHaveLength(1)
    expect(result[0].sets).toHaveLength(3)
    expect(result[0].sets[0].isWarmup).toBe(true)
    expect(result[0].sets[1].isWarmup).toBe(false)
    expect(result[0].sets[2].isPr).toBe(true)
  })

  it('propagates PR flag correctly', () => {
    const sets: MockSet[] = [
      { id: 's1', exercise_id: 'ex1', set_number: 1, weight_kg: 100, reps: 8, rpe: 8, is_warmup: false, is_pr: true, completed_at: '2026-02-24T10:00:00Z', exercises: { name_en: 'Bench', name_fr: 'Développé' } },
      { id: 's2', exercise_id: 'ex1', set_number: 2, weight_kg: 100, reps: 6, rpe: 9, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:02:00Z', exercises: { name_en: 'Bench', name_fr: 'Développé' } },
    ]

    const result = groupSetsIntoExercises(sets)
    expect(result[0].sets[0].isPr).toBe(true)
    expect(result[0].sets[1].isPr).toBe(false)
  })

  it('handles null weight and rpe as null (not 0)', () => {
    const sets: MockSet[] = [
      { id: 's1', exercise_id: 'ex1', set_number: 1, weight_kg: null, reps: 15, rpe: null, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:00:00Z', exercises: { name_en: 'Pull-ups', name_fr: 'Tractions' } },
      { id: 's2', exercise_id: 'ex1', set_number: 2, weight_kg: 0, reps: 12, rpe: null, is_warmup: false, is_pr: false, completed_at: '2026-02-24T10:02:00Z', exercises: { name_en: 'Pull-ups', name_fr: 'Tractions' } },
    ]

    const result = groupSetsIntoExercises(sets)
    expect(result[0].sets[0].weightKg).toBeNull()
    expect(result[0].sets[0].rpe).toBeNull()
    expect(result[0].sets[1].weightKg).toBe(0) // 0 is preserved, not null
  })

  it('returns empty exercises array for session with no sets', () => {
    const result = groupSetsIntoExercises([])
    expect(result).toEqual([])
  })
})
