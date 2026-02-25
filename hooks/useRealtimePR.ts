import { useEffect, useRef, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { ActiveExercise, WorkoutSet } from '@/stores/useWorkoutStore'

export interface PRState {
  isPR: boolean
  previousMax: number
  newMax: number
  delta: number
}

/**
 * Real-time PR detection for all exercises in the active workout.
 *
 * On mount: single batched query for all exercises' historical max weights.
 * Mid-workout exercise additions: supplemental single-exercise fetch.
 * Compares each completed working set's weight against cached max.
 *
 * Returns Map<exerciseId, PRState | null>.
 */
export function useRealtimePR(
  exerciseIds: string[],
  sessionId: string | null,
  exercises: ActiveExercise[]
): Map<string, PRState | null> {
  const queryClient = useQueryClient()

  // Batched query for historical max weights (all exercises at once)
  const { data: historicalMaxes } = useQuery({
    queryKey: ['historical-maxes', sessionId],
    queryFn: async () => {
      if (exerciseIds.length === 0) return new Map<string, number>()

      // TODO: migrate to Postgres RPC with max() aggregation for power users with hundreds of sessions
      const { data, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight_kg')
        .in('exercise_id', exerciseIds)
        .eq('is_warmup', false)
        .neq('session_id', sessionId ?? '')
        .order('weight_kg', { ascending: false })

      if (error) throw error

      // Group by exercise_id, take max per exercise
      const maxMap = new Map<string, number>()
      for (const row of data ?? []) {
        if (row.weight_kg == null) continue
        if (!maxMap.has(row.exercise_id)) {
          maxMap.set(row.exercise_id, row.weight_kg)
        }
      }
      return maxMap
    },
    enabled: !!sessionId && exerciseIds.length > 0,
    staleTime: Infinity,
  })

  // Ref to hold max map (extends with supplemental fetches for mid-workout exercise additions)
  const maxMapRef = useRef<Map<string, number>>(new Map())

  // Sync query result into ref
  useEffect(() => {
    if (historicalMaxes) {
      maxMapRef.current = new Map(historicalMaxes)
    }
  }, [historicalMaxes])

  // Supplemental fetches for exercises added mid-workout (not in initial query)
  const fetchingRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!sessionId || !historicalMaxes) return

    for (const id of exerciseIds) {
      if (maxMapRef.current.has(id) || fetchingRef.current.has(id)) continue
      fetchingRef.current.add(id)

      supabase
        .from('workout_sets')
        .select('weight_kg')
        .eq('exercise_id', id)
        .eq('is_warmup', false)
        .neq('session_id', sessionId)
        .order('weight_kg', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          const maxWeight = data?.[0]?.weight_kg ?? 0
          maxMapRef.current.set(id, maxWeight)
          fetchingRef.current.delete(id)
          // Trigger re-render by invalidating a dummy key
          queryClient.invalidateQueries({ queryKey: ['pr-supplemental', id] })
        })
    }
  }, [exerciseIds, sessionId, historicalMaxes, queryClient])

  // Track which set IDs have already triggered celebration (prevent re-fire on re-renders)
  const celebratedRef = useRef<Set<string>>(new Set())

  // Compute per-exercise PR state from current sets vs historical maxes
  return useMemo(() => {
    const result = new Map<string, PRState | null>()

    for (const exercise of exercises) {
      const exId = exercise.exerciseId

      // If max data not available yet (pending supplemental fetch), return null
      if (!maxMapRef.current.has(exId)) {
        result.set(exId, null)
        continue
      }

      const historicalMax = maxMapRef.current.get(exId)!

      // Find current max from completed working sets
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
  }, [exercises, historicalMaxes])
}
