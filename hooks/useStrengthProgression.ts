import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { daysAgo, rangeToDays } from '@/lib/formulas'
import { computeStrengthPoints, type StrengthDataPoint } from '@/lib/chartTransforms'

export type { StrengthDataPoint }

export function useStrengthProgression(exerciseId: string | null, range: string) {
  return useQuery<StrengthDataPoint[]>({
    queryKey: ['strength-progression', exerciseId, range],
    enabled: !!exerciseId,
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
        .eq('exercise_id', exerciseId!)
        .eq('is_warmup', false)
        .in('session_id', sessionIds)

      if (setsError) throw setsError
      if (!sets || sets.length === 0) return []

      return computeStrengthPoints(sessions, sets, range)
    },
  })
}
