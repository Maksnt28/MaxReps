import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SessionSummary } from './useWorkoutSessions'

export interface MonthData {
  sessions: SessionSummary[]
  workoutDays: Set<number>
  prDays: Set<number>
  totalSessions: number
  totalVolume: number
  totalPRs: number
}

const EMPTY_MONTH: MonthData = {
  sessions: [],
  workoutDays: new Set(),
  prDays: new Set(),
  totalSessions: 0,
  totalVolume: 0,
  totalPRs: 0,
}

export function monthSessionsQueryKey(year: number, month: number) {
  return ['month-sessions', year, month] as const
}

export async function monthSessionsQueryFn(year: number, month: number): Promise<MonthData> {
  const monthStart = new Date(year, month - 1, 1).toISOString()
  const nextMonthStart = new Date(year, month, 1).toISOString()

  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select('id, started_at, finished_at, duration_seconds, notes, program_day_id, program_days(name)')
    .not('finished_at', 'is', null)
    .gte('started_at', monthStart)
    .lt('started_at', nextMonthStart)
    .order('started_at', { ascending: false })

  if (error) throw error
  if (!sessions || sessions.length === 0) return EMPTY_MONTH

  // Batch fetch sets
  const sessionIds = sessions.map((s) => s.id)
  const { data: sets, error: setsError } = await supabase
    .from('workout_sets')
    .select('session_id, exercise_id, weight_kg, reps, is_warmup, is_pr')
    .in('session_id', sessionIds)
    .order('completed_at', { ascending: true })

  if (setsError) throw setsError

  const workoutDays = new Set<number>()
  const prDays = new Set<number>()
  let totalVolume = 0
  let totalPRs = 0

  const summaries: SessionSummary[] = sessions.map((s) => {
    const sessionSets = (sets ?? []).filter((set) => set.session_id === s.id)
    const workingSets = sessionSets.filter((set) => !set.is_warmup)
    const exerciseIds = [...new Set(sessionSets.map((set) => set.exercise_id))]
    const volume = workingSets.reduce(
      (sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0,
    )
    const prCount = workingSets.filter((set) => set.is_pr).length

    const dayOfMonth = new Date(s.started_at).getDate()
    workoutDays.add(dayOfMonth)
    if (prCount > 0) prDays.add(dayOfMonth)
    totalVolume += volume
    totalPRs += prCount

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
      totalVolume: Math.round(volume),
      prCount,
    }
  })

  return {
    sessions: summaries,
    workoutDays,
    prDays,
    totalSessions: summaries.length,
    totalVolume: Math.round(totalVolume),
    totalPRs,
  }
}

export function useMonthSessions(year: number, month: number) {
  return useQuery({
    queryKey: monthSessionsQueryKey(year, month),
    queryFn: () => monthSessionsQueryFn(year, month),
    staleTime: 10 * 60 * 1000,
  })
}
