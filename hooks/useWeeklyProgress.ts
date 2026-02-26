import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import {
  getMondayOfWeek,
  getNextMonday,
  computeWeeklyDays,
} from '@/lib/weeklyProgress'

export interface WeeklyProgressData {
  daysCompleted: number
  daysTarget: number | null
  sessions: number
  workoutDayNumbers: Set<number> // JS day indices (0=Sun .. 6=Sat)
}

export function useWeeklyProgress() {
  const daysPerWeek = useUserStore((s) => s.daysPerWeek)

  return useQuery<WeeklyProgressData>({
    queryKey: ['weekly-progress'],
    queryFn: async () => {
      const monday = getMondayOfWeek()
      const nextMonday = getNextMonday(monday)

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('finished_at')
        .not('finished_at', 'is', null)
        .gte('finished_at', monday.toISOString())
        .lt('finished_at', nextMonday.toISOString())

      if (error) throw error

      const dates = (data ?? []).map((r) => r.finished_at as string)
      const { daysCompleted, workoutDayNumbers } = computeWeeklyDays(dates, monday, nextMonday)

      return {
        daysCompleted,
        daysTarget: daysPerWeek,
        sessions: dates.length,
        workoutDayNumbers,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
