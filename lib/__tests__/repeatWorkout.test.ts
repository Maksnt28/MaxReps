import { describe, it, expect } from 'vitest'

// Test the pure mapping logic used in the repeat workout flow:
// SessionExercise[] → loadProgramDay format (warmup exclusion, set count)

interface SessionSet {
  id: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  rpe: number | null
  isWarmup: boolean
  isPr: boolean
}

interface SessionExercise {
  exerciseId: string
  nameEn: string
  nameFr: string
  sets: SessionSet[]
}

function mapExercisesForRepeat(exercises: SessionExercise[]) {
  return exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    setsTarget: ex.sets.filter((s) => !s.isWarmup).length,
    repsTarget: null,
    restSeconds: null,
  }))
}

describe('repeat workout — exercise mapping', () => {
  it('maps exercises with correct working set count (warmups excluded)', () => {
    const exercises: SessionExercise[] = [
      {
        exerciseId: 'ex1',
        nameEn: 'Bench Press',
        nameFr: 'Développé couché',
        sets: [
          { id: 'w1', setNumber: 1, weightKg: 40, reps: 10, rpe: null, isWarmup: true, isPr: false },
          { id: 's1', setNumber: 2, weightKg: 100, reps: 8, rpe: 8, isWarmup: false, isPr: false },
          { id: 's2', setNumber: 3, weightKg: 100, reps: 6, rpe: 9, isWarmup: false, isPr: true },
          { id: 's3', setNumber: 4, weightKg: 100, reps: 5, rpe: 10, isWarmup: false, isPr: false },
        ],
      },
    ]

    const result = mapExercisesForRepeat(exercises)
    expect(result).toEqual([
      { exerciseId: 'ex1', setsTarget: 3, repsTarget: null, restSeconds: null },
    ])
  })

  it('maps multiple exercises preserving order', () => {
    const exercises: SessionExercise[] = [
      {
        exerciseId: 'ex-bench', nameEn: 'Bench', nameFr: 'Développé',
        sets: [
          { id: 's1', setNumber: 1, weightKg: 100, reps: 8, rpe: null, isWarmup: false, isPr: false },
          { id: 's2', setNumber: 2, weightKg: 100, reps: 6, rpe: null, isWarmup: false, isPr: false },
        ],
      },
      {
        exerciseId: 'ex-squat', nameEn: 'Squat', nameFr: 'Squat',
        sets: [
          { id: 'w1', setNumber: 1, weightKg: 60, reps: 5, rpe: null, isWarmup: true, isPr: false },
          { id: 's3', setNumber: 2, weightKg: 140, reps: 5, rpe: null, isWarmup: false, isPr: false },
          { id: 's4', setNumber: 3, weightKg: 140, reps: 5, rpe: null, isWarmup: false, isPr: false },
          { id: 's5', setNumber: 4, weightKg: 140, reps: 3, rpe: null, isWarmup: false, isPr: false },
        ],
      },
    ]

    const result = mapExercisesForRepeat(exercises)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ exerciseId: 'ex-bench', setsTarget: 2, repsTarget: null, restSeconds: null })
    expect(result[1]).toEqual({ exerciseId: 'ex-squat', setsTarget: 3, repsTarget: null, restSeconds: null })
  })

  it('returns setsTarget 0 for exercise with only warmup sets', () => {
    const exercises: SessionExercise[] = [
      {
        exerciseId: 'ex1', nameEn: 'Test', nameFr: 'Test',
        sets: [
          { id: 'w1', setNumber: 1, weightKg: 20, reps: 10, rpe: null, isWarmup: true, isPr: false },
          { id: 'w2', setNumber: 2, weightKg: 40, reps: 5, rpe: null, isWarmup: true, isPr: false },
        ],
      },
    ]

    const result = mapExercisesForRepeat(exercises)
    expect(result[0].setsTarget).toBe(0)
  })

  it('always sets repsTarget and restSeconds to null', () => {
    const exercises: SessionExercise[] = [
      {
        exerciseId: 'ex1', nameEn: 'Test', nameFr: 'Test',
        sets: [
          { id: 's1', setNumber: 1, weightKg: 80, reps: 12, rpe: 7, isWarmup: false, isPr: false },
        ],
      },
    ]

    const result = mapExercisesForRepeat(exercises)
    expect(result[0].repsTarget).toBeNull()
    expect(result[0].restSeconds).toBeNull()
  })
})
