import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { daysAgo } from '@/lib/formulas'
import { computeFrequencyPoints, type FrequencyDataPoint } from '@/lib/chartTransforms'

export type { FrequencyDataPoint }

export function useWorkoutFrequency() {
  return useQuery<FrequencyDataPoint[]>({
    queryKey: ['workout-frequency'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const startDate = daysAgo(60)

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('started_at')
        .not('finished_at', 'is', null)
        .gte('started_at', startDate)
        .order('started_at', { ascending: true })

      if (error) throw error
      if (!sessions || sessions.length === 0) return []

      return computeFrequencyPoints(sessions)
    },
  })
}
