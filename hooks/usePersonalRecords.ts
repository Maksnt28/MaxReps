import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { supabase } from '@/lib/supabase'

export type PersonalRecord = {
  exerciseId: string
  exerciseName: string
  weightKg: number
  reps: number
  date: string
  previousMax: number | null
}

export function usePersonalRecords() {
  const { i18n } = useTranslation()
  const locale = i18n.language

  return useQuery<PersonalRecord[]>({
    queryKey: ['personal-records', locale],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Fetch recent PR sets joined with exercise names
      const { data: prSets, error: prError } = await supabase
        .from('workout_sets')
        .select(`
          exercise_id,
          weight_kg,
          reps,
          completed_at,
          session_id,
          exercises!inner(name_en, name_fr)
        `)
        .eq('is_pr', true)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (prError) throw prError
      if (!prSets || prSets.length === 0) return []

      // Deduplicate — keep only the most recent PR per exercise
      const seen = new Set<string>()
      const unique: PersonalRecord[] = []

      for (const pr of prSets) {
        if (seen.has(pr.exercise_id)) continue
        seen.add(pr.exercise_id)

        const ex = pr.exercises as unknown as { name_en: string; name_fr: string }
        const exerciseName = locale === 'fr' ? ex?.name_fr : ex?.name_en ?? ''

        unique.push({
          exerciseId: pr.exercise_id,
          exerciseName,
          weightKg: pr.weight_kg ?? 0,
          reps: pr.reps ?? 0,
          date: pr.completed_at?.split('T')[0] ?? '',
          previousMax: null,
        })

        if (unique.length >= 5) break
      }

      return unique
    },
  })
}
