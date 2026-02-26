import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { computeStreaks } from '@/lib/streakCalculation'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalWeeksActive: number
}

export function useWorkoutStreak() {
  const userId = useUserStore((s) => s.id)

  return useQuery<StreakData>({
    queryKey: ['workout-streak', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('started_at')
        .eq('user_id', userId!)
        .not('finished_at', 'is', null)
        .order('started_at', { ascending: false })

      if (error) throw error

      const dates = (data ?? []).map((r) => r.started_at)
      return computeStreaks(dates)
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!userId,
  })
}
