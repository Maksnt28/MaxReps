import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { detectPRs } from '@/lib/prDetection'
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
      queryClient.invalidateQueries({ queryKey: ['strength-progression'] })
      queryClient.invalidateQueries({ queryKey: ['volume-progression'] })
      queryClient.invalidateQueries({ queryKey: ['workout-frequency'] })
      queryClient.invalidateQueries({ queryKey: ['personal-records'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-exercises'] })
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

      const completedSets = params.exercises.flatMap((exercise) =>
        exercise.sets
          .filter((s) => s.isCompleted)
          .map((s) => ({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
            rpe: s.rpe,
            isWarmup: s.isWarmup,
            completedAt: s.completedAt ?? new Date().toISOString(),
          }))
      )

      // Batch-query historical max weights for PR detection
      const exerciseIds = [...new Set(
        completedSets
          .filter((s) => !s.isWarmup && s.weightKg && s.weightKg > 0)
          .map((s) => s.exerciseId)
      )]

      let historyMap: Record<string, number> = {}
      if (exerciseIds.length > 0) {
        const { data: maxRows } = await supabase
          .from('workout_sets')
          .select('exercise_id, weight_kg')
          .in('exercise_id', exerciseIds)
          .eq('is_warmup', false)
          .order('weight_kg', { ascending: false })

        if (maxRows) {
          for (const row of maxRows) {
            if (
              row.exercise_id &&
              row.weight_kg != null &&
              (historyMap[row.exercise_id] == null || row.weight_kg > historyMap[row.exercise_id])
            ) {
              historyMap[row.exercise_id] = row.weight_kg
            }
          }
        }
      }

      const prKeys = detectPRs(completedSets, historyMap)

      // Only mark ONE set per exercise as PR (the first matching set)
      const prMarked = new Set<string>()
      const sets = completedSets.map((s) => {
        const isPr = prKeys.has(`${s.exerciseId}:${s.weightKg}`) && !prMarked.has(s.exerciseId)
        if (isPr) prMarked.add(s.exerciseId)
        return {
          session_id: params.sessionId,
          exercise_id: s.exerciseId,
          set_number: s.setNumber,
          weight_kg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          is_warmup: s.isWarmup,
          is_pr: isPr,
          completed_at: s.completedAt,
        }
      })

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
