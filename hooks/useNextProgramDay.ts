import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { getNextDayIndex, buildDayCompletions } from '@/lib/nextProgramDay'
import type { ProgramDayWithExercises } from './usePrograms'

export { getNextDayIndex, estimateDuration } from '@/lib/nextProgramDay'

type Program = {
  id: string
  name: string
  program_days: ProgramDayWithExercises[]
}

export interface NextProgramDayResult {
  nextDay: ProgramDayWithExercises
  allDays: ProgramDayWithExercises[]
  program: Program
  dayIndex: number   // 0-based index in sorted days
  totalDays: number
  dayCompletions: Record<string, string>  // dayId → most recent started_at ISO
}

export function nextProgramDayQueryKey(userId: string) {
  return ['next-program-day', userId] as const
}

export async function nextProgramDayQueryFn(
  userId: string,
): Promise<NextProgramDayResult | null> {
  // 1. Fetch active program with full day/exercise data
  const { data: programs, error: progError } = await supabase
    .from('programs')
    .select('*, program_days(*, program_exercises(*, exercise:exercises(*)))')
    .eq('is_active', true)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (progError) throw progError
  if (!programs || programs.length === 0) return null

  const program = programs[0] as unknown as Program
  if (!program.program_days || program.program_days.length === 0) return null

  // Sort days by day_number
  const sortedDays = [...program.program_days].sort(
    (a, b) => a.day_number - b.day_number,
  )
  // Sort exercises within each day
  for (const day of sortedDays) {
    day.program_exercises.sort((a, b) => a.order - b.order)
  }

  const dayIds = sortedDays.map((d) => d.id)

  // 2. Fetch all finished sessions for this program's days
  const { data: sessions, error: sessError } = await supabase
    .from('workout_sessions')
    .select('program_day_id, started_at')
    .in('program_day_id', dayIds)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })

  if (sessError) throw sessError

  const lastDayId = sessions && sessions.length > 0 ? sessions[0].program_day_id : null

  const idx = getNextDayIndex(dayIds, lastDayId)
  if (idx === -1) return null

  const dayCompletions = buildDayCompletions(
    sessions as { program_day_id: string | null; started_at: string }[],
    dayIds,
  )

  return {
    nextDay: sortedDays[idx],
    allDays: sortedDays,
    program,
    dayIndex: idx,
    totalDays: sortedDays.length,
    dayCompletions,
  }
}

export function useNextProgramDay() {
  const userId = useUserStore((s) => s.id)

  return useQuery({
    queryKey: nextProgramDayQueryKey(userId!),
    queryFn: () => nextProgramDayQueryFn(userId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  })
}
