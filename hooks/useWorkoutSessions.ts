import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

export interface SessionSummary {
  id: string
  startedAt: string
  finishedAt: string | null
  durationSeconds: number | null
  notes: string | null
  programDayId: string | null
  programDayName: string | null
  exerciseIds: string[]
  exerciseCount: number
  setCount: number
  totalVolume: number
  prCount: number
}

export function useWorkoutSessions() {
  return useInfiniteQuery({
    queryKey: ['workout-sessions'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('id, started_at, finished_at, duration_seconds, notes, program_day_id, program_days(name)')
        .not('finished_at', 'is', null)
        .order('started_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)

      if (error) throw error
      if (!sessions || sessions.length === 0) return { sessions: [], nextPage: null }

      // Batch fetch sets for all sessions on this page
      // Order by completed_at so [...new Set()] preserves first-appearance order
      const sessionIds = sessions.map((s) => s.id)
      const { data: sets, error: setsError } = await supabase
        .from('workout_sets')
        .select('session_id, exercise_id, weight_kg, reps, is_warmup, is_pr')
        .in('session_id', sessionIds)
        .order('completed_at', { ascending: true })

      if (setsError) throw setsError

      // Aggregate per session
      const summaries: SessionSummary[] = sessions.map((s) => {
        const sessionSets = (sets ?? []).filter((set) => set.session_id === s.id)
        const workingSets = sessionSets.filter((set) => !set.is_warmup)
        const exerciseIds = [...new Set(sessionSets.map((set) => set.exercise_id))]
        const totalVolume = workingSets.reduce(
          (sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0
        )
        const prCount = workingSets.filter((set) => set.is_pr).length

        const programDay = (s as any).program_days as { name: string } | null
        return {
          id: s.id,
          startedAt: s.started_at,
          finishedAt: s.finished_at,
          durationSeconds: s.duration_seconds,
          notes: s.notes,
          programDayId: s.program_day_id,
          programDayName: programDay?.name ?? null,
          exerciseIds,
          exerciseCount: exerciseIds.length,
          setCount: workingSets.length,
          totalVolume: Math.round(totalVolume),
          prCount,
        }
      })

      return {
        sessions: summaries,
        nextPage: sessions.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 10 * 60 * 1000,
  })
}
