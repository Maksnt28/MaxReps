import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SessionSet {
  id: string
  setNumber: number
  weightKg: number | null
  reps: number | null
  rpe: number | null
  isWarmup: boolean
  isPr: boolean
  completedAt: string | null
}

export interface SessionExercise {
  exerciseId: string
  nameEn: string
  nameFr: string
  sets: SessionSet[]
}

export interface SessionDetail {
  id: string
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
  notes: string | null
  programDayId: string | null
  programDayName: string | null
  exercises: SessionExercise[]
}

export function useWorkoutSession(sessionId: string) {
  return useQuery({
    queryKey: ['workout-session', sessionId],
    queryFn: async () => {
      // Fetch session
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .select('id, started_at, finished_at, duration_seconds, notes, program_day_id, program_days(name)')
        .eq('id', sessionId)
        .single()

      if (error) throw error

      // Fetch sets with exercise names via join
      // Order by completed_at to preserve workout order
      const { data: sets, error: setsError } = await supabase
        .from('workout_sets')
        .select('id, exercise_id, set_number, weight_kg, reps, rpe, is_warmup, is_pr, completed_at, exercises(name_en, name_fr)')
        .eq('session_id', sessionId)
        .order('completed_at', { ascending: true })

      if (setsError) throw setsError

      // Group sets by exercise — Map insertion order preserves workout sequence
      const exerciseMap = new Map<string, SessionExercise>()
      for (const set of sets ?? []) {
        const exId = set.exercise_id
        if (!exerciseMap.has(exId)) {
          const joined = set.exercises as any
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
          completedAt: set.completed_at,
        })
      }

      // Sort sets within each exercise by set_number
      for (const exercise of exerciseMap.values()) {
        exercise.sets.sort((a, b) => a.setNumber - b.setNumber)
      }

      const programDay = (session as any).program_days as { name: string } | null
      return {
        id: session.id,
        startedAt: session.started_at,
        finishedAt: session.finished_at,
        durationSeconds: session.duration_seconds,
        notes: session.notes,
        programDayId: session.program_day_id,
        programDayName: programDay?.name ?? null,
        exercises: [...exerciseMap.values()],
      } satisfies SessionDetail
    },
    staleTime: 10 * 60 * 1000,
  })
}
