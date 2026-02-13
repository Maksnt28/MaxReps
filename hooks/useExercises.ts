import { useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type Exercise = Database['public']['Tables']['exercises']['Row']

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name_en')

      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function useExercise(id: string) {
  const queryClient = useQueryClient()

  return useQuery<Exercise>({
    queryKey: ['exercises', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    initialData: () => {
      const exercises = queryClient.getQueryData<Exercise[]>(['exercises'])
      return exercises?.find((e) => e.id === id)
    },
    staleTime: Infinity,
  })
}
