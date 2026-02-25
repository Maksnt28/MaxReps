import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
export { parseLimitations, formatLimitations } from '@/lib/profileHelpers'

interface ProfileUpdate {
  experience_level?: string
  goals?: string[]
  equipment?: string[]
  limitations?: string[]
  schedule?: { days_per_week: number }
  locale?: string
  sex?: string | null
  age?: number | null
  height_cm?: number | null
  weight_kg?: number | null
  default_rest_seconds?: number | null
  rest_seconds_success?: number | null
  rest_seconds_failure?: number | null
}

export function useUpdateProfile() {
  const userId = useUserStore((s) => s.id)

  return useMutation({
    mutationFn: async (payload: ProfileUpdate) => {
      if (!userId) throw new Error('No user ID')

      const { error } = await supabase
        .from('users')
        .update(payload as any)
        .eq('id', userId)

      if (error) throw error
    },
  })
}
