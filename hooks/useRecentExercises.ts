import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { supabase } from '@/lib/supabase'

export type RecentExercise = {
  exerciseId: string
  name: string
  count: number
}

export function useRecentExercises() {
  const { i18n } = useTranslation()
  const locale = i18n.language

  return useQuery<RecentExercise[]>({
    queryKey: ['recent-exercises', locale],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Fetch non-warmup sets with exercise info
      const { data: sets, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, exercises!inner(name_en, name_fr)')
        .eq('is_warmup', false)

      if (error) throw error
      if (!sets || sets.length === 0) return []

      // Count sets per exercise
      const countMap = new Map<string, { name: string; count: number }>()
      for (const set of sets) {
        const ex = set.exercises as unknown as { name_en: string; name_fr: string }
        const exerciseName = locale === 'fr' ? ex?.name_fr : ex?.name_en ?? ''
        const existing = countMap.get(set.exercise_id)
        if (existing) {
          existing.count++
        } else {
          countMap.set(set.exercise_id, { name: exerciseName, count: 1 })
        }
      }

      // Sort by count descending (most trained first)
      return Array.from(countMap.entries())
        .map(([exerciseId, { name, count }]) => ({ exerciseId, name, count }))
        .sort((a, b) => b.count - a.count)
    },
  })
}
