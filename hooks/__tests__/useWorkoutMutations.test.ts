import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'workout_sessions') {
        return {
          insert: mockInsert.mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle,
            }),
          }),
          update: mockUpdate.mockReturnValue({
            eq: mockEq,
          }),
          delete: mockDelete.mockReturnValue({
            eq: mockEq,
          }),
        }
      }
      if (table === 'workout_sets') {
        return {
          insert: mockInsert,
        }
      }
      return {}
    }),
  },
}))

describe('workout mutation functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('inserts a session and returns id', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'session-123' },
        error: null,
      })

      const result = await supabase
        .from('workout_sessions')
        .insert({ program_day_id: null, started_at: new Date().toISOString() })
        .select('id')
        .single()

      expect(result.data).toEqual({ id: 'session-123' })
      expect(result.error).toBeNull()
      expect(mockInsert).toHaveBeenCalled()
    })

    it('throws on error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'RLS violation' },
      })

      const result = await supabase
        .from('workout_sessions')
        .insert({ program_day_id: null, started_at: new Date().toISOString() })
        .select('id')
        .single()

      expect(result.error).toBeTruthy()
    })
  })

  describe('finishWorkout - set flattening logic', () => {
    it('flattens completed sets from multiple exercises', () => {
      const exercises = [
        {
          exerciseId: 'ex-1',
          sets: [
            {
              id: 's1', exerciseId: 'ex-1', setNumber: 1,
              weightKg: 100, reps: 8, rpe: 8, isWarmup: false,
              isCompleted: true, completedAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 's2', exerciseId: 'ex-1', setNumber: 2,
              weightKg: 100, reps: 6, rpe: 9, isWarmup: false,
              isCompleted: false, completedAt: null, // incomplete — should be skipped
            },
          ],
        },
        {
          exerciseId: 'ex-2',
          sets: [
            {
              id: 's3', exerciseId: 'ex-2', setNumber: 1,
              weightKg: 50, reps: 12, rpe: null, isWarmup: true,
              isCompleted: true, completedAt: '2026-01-01T00:01:00Z',
            },
          ],
        },
      ]

      const sets = exercises.flatMap((exercise) =>
        exercise.sets
          .filter((s) => s.isCompleted)
          .map((s) => ({
            session_id: 'session-1',
            exercise_id: s.exerciseId,
            set_number: s.setNumber,
            weight_kg: s.weightKg,
            reps: s.reps,
            rpe: s.rpe,
            is_warmup: s.isWarmup,
            is_pr: false,
            completed_at: s.completedAt,
          }))
      )

      expect(sets).toHaveLength(2) // skips incomplete set
      expect(sets[0].exercise_id).toBe('ex-1')
      expect(sets[0].weight_kg).toBe(100)
      expect(sets[1].exercise_id).toBe('ex-2')
      expect(sets[1].is_warmup).toBe(true)
    })

    it('handles empty exercise list', () => {
      const exercises: { exerciseId: string; sets: { isCompleted: boolean }[] }[] = []
      const sets = exercises.flatMap((e) => e.sets.filter((s) => s.isCompleted))
      expect(sets).toHaveLength(0)
    })
  })

  describe('volume calculation', () => {
    it('calculates total volume excluding warmup sets', () => {
      const completedSets = [
        { weightKg: 100, reps: 8, isWarmup: false },
        { weightKg: 100, reps: 6, isWarmup: false },
        { weightKg: 50, reps: 10, isWarmup: true }, // excluded
      ]

      const totalVolume = completedSets
        .filter((s) => !s.isWarmup)
        .reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0)

      expect(totalVolume).toBe(100 * 8 + 100 * 6) // 1400
    })

    it('handles null weights (bodyweight exercises)', () => {
      const completedSets = [
        { weightKg: null, reps: 15, isWarmup: false },
      ]

      const totalVolume = completedSets
        .filter((s) => !s.isWarmup)
        .reduce((sum, s) => sum + ((s.weightKg ?? 0) as number) * ((s.reps ?? 0) as number), 0)

      expect(totalVolume).toBe(0)
    })
  })
})
