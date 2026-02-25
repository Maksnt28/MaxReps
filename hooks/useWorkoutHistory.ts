import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { SessionHistory } from '@/lib/overload'

export function useExerciseHistory(
  exerciseId: string,
  currentSessionId?: string
) {
  return useQuery<SessionHistory[]>({
    queryKey: ['exercise-history', exerciseId],
    queryFn: async () => {
      // Step 1: Fetch the 2 most recent completed sessions with non-warmup sets
      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id, started_at, workout_sets!inner(exercise_id, is_warmup)')
        .not('finished_at', 'is', null)
        .neq('id', currentSessionId ?? '')
        .eq('workout_sets.exercise_id', exerciseId)
        .eq('workout_sets.is_warmup', false)
        .order('started_at', { ascending: false })
        .limit(2)

      if (sessionsError) throw sessionsError
      if (!sessions || sessions.length === 0) return []

      // Step 2: Fetch all non-warmup sets for those 2 sessions
      const sessionIds = sessions.map((s) => s.id)
      const { data: sets, error: setsError } = await supabase
        .from('workout_sets')
        .select('weight_kg, reps, rpe, session_id, set_number')
        .eq('exercise_id', exerciseId)
        .eq('is_warmup', false)
        .in('session_id', sessionIds)
        .order('set_number', { ascending: true })

      if (setsError) throw setsError

      // Group by session_id, ordered newest first
      const setsBySession = new Map<string, typeof sets>()
      for (const s of sets ?? []) {
        const existing = setsBySession.get(s.session_id) ?? []
        existing.push(s)
        setsBySession.set(s.session_id, existing)
      }

      return sessions.map((session) => ({
        startedAt: session.started_at,
        sets: (setsBySession.get(session.id) ?? [])
          .filter((s) => s.weight_kg != null)
          .map((s) => ({
            weightKg: s.weight_kg!,
            reps: s.reps ?? 0,
            rpe: s.rpe,
          })),
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
