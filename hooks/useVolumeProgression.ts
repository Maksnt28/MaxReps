import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { daysAgo, rangeToDays } from '@/lib/formulas'
import { computeVolumePoints, type VolumeDataPoint } from '@/lib/chartTransforms'

export type { VolumeDataPoint }

export function useVolumeProgression(range: string) {
  return useQuery<VolumeDataPoint[]>({
    queryKey: ['volume-progression', range],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const days = rangeToDays(range)
      const startDate = daysAgo(days)

      const { data: sessions, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .not('finished_at', 'is', null)
        .gte('started_at', startDate)
        .order('started_at', { ascending: true })

      if (sessionsError) throw sessionsError
      if (!sessions || sessions.length === 0) return []

      const sessionIds = sessions.map((s) => s.id)

      const { data: sets, error: setsError } = await supabase
        .from('workout_sets')
        .select('session_id, weight_kg, reps')
        .eq('is_warmup', false)
        .in('session_id', sessionIds)

      if (setsError) throw setsError

      return computeVolumePoints(sessions, sets ?? [], range)
    },
  })
}
