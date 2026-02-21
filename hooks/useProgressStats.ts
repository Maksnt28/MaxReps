import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { daysAgo, rangeToDays } from '@/lib/formulas'

export type ProgressStats = {
  workouts: number
  workoutsDelta: number | null
  totalVolume: number
  volumeDelta: number | null
  prCount: number
  avgDuration: number // in minutes
  durationDelta: number | null
}

export function useProgressStats(range: string) {
  return useQuery<ProgressStats>({
    queryKey: ['progress-stats', range],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const days = rangeToDays(range)
      // Fetch 2× date range to compute deltas
      const startDate = daysAgo(days * 2)
      const midDate = daysAgo(days)

      // Fetch sessions in the 2× range
      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id, started_at, duration_seconds')
        .not('finished_at', 'is', null)
        .gte('started_at', startDate)
        .order('started_at', { ascending: true })

      if (sessionsError) throw sessionsError

      const currentSessions = (sessions ?? []).filter((s) => s.started_at >= midDate)
      const previousSessions = (sessions ?? []).filter((s) => s.started_at < midDate)

      // Fetch sets for all sessions to compute volume
      const allSessionIds = (sessions ?? []).map((s) => s.id)
      let allSets: { session_id: string; weight_kg: number | null; reps: number | null; is_pr: boolean }[] = []

      if (allSessionIds.length > 0) {
        const { data: sets, error: setsError } = await supabase
          .from('workout_sets')
          .select('session_id, weight_kg, reps, is_pr')
          .in('session_id', allSessionIds)

        if (setsError) throw setsError
        allSets = sets ?? []
      }

      const currentSessionIds = new Set(currentSessions.map((s) => s.id))
      const previousSessionIds = new Set(previousSessions.map((s) => s.id))

      // Volume
      const computeVolume = (sessionIds: Set<string>) =>
        allSets
          .filter((s) => sessionIds.has(s.session_id))
          .reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0)

      const currentVolume = computeVolume(currentSessionIds)
      const previousVolume = computeVolume(previousSessionIds)

      // PR count (current period only)
      const prCount = allSets
        .filter((s) => currentSessionIds.has(s.session_id) && s.is_pr)
        .length

      // Avg duration
      const computeAvgDuration = (sess: typeof currentSessions) => {
        const durations = sess
          .map((s) => s.duration_seconds)
          .filter((d): d is number => d != null && d > 0)
        if (durations.length === 0) return 0
        return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
      }

      const currentAvgDuration = computeAvgDuration(currentSessions)
      const previousAvgDuration = computeAvgDuration(previousSessions)

      // Compute deltas (null if no previous data)
      const computeDelta = (current: number, previous: number) => {
        if (previous === 0) return null
        return Math.round(((current - previous) / previous) * 100)
      }

      return {
        workouts: currentSessions.length,
        workoutsDelta: previousSessions.length > 0
          ? computeDelta(currentSessions.length, previousSessions.length)
          : null,
        totalVolume: currentVolume,
        volumeDelta: computeDelta(currentVolume, previousVolume),
        prCount,
        avgDuration: currentAvgDuration,
        durationDelta: computeDelta(currentAvgDuration, previousAvgDuration),
      }
    },
  })
}
