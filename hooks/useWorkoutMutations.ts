import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { ActiveExercise } from '@/stores/useWorkoutStore'

export function useCreateSession() {
  return useMutation({
    mutationFn: async (params: { programDayId?: string }) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          program_day_id: params.programDayId ?? null,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) throw error
      return data
    },
  })
}

export function useFinishWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
    },
    mutationFn: async (params: {
      sessionId: string
      startedAt: string
      exercises: ActiveExercise[]
      notes: string
    }) => {
      const now = new Date()
      const startedAt = new Date(params.startedAt)
      const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000)

      const sets = params.exercises.flatMap((exercise) =>
        exercise.sets
          .filter((s) => s.isCompleted)
          .map((s) => ({
            session_id: params.sessionId,
            exercise_id: s.exerciseId,
            set_number: s.setNumber,
            weight_kg: s.weightKg,
            reps: s.reps,
            rpe: s.rpe,
            is_warmup: s.isWarmup,
            is_pr: false,
            completed_at: s.completedAt ?? new Date().toISOString(),
          }))
      )

      if (sets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(sets)
        if (setsError) throw setsError
      }

      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update({
          finished_at: now.toISOString(),
          duration_seconds: durationSeconds,
          notes: params.notes || null,
        })
        .eq('id', params.sessionId)

      if (sessionError) throw sessionError

      return { durationSeconds, setsCount: sets.length }
    },
  })
}

export function useDiscardWorkout() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId)
      if (error) throw error
    },
  })
}
