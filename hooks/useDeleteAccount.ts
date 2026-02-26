import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { useRestTimerStore } from '@/stores/useRestTimerStore'
import { useUserStore } from '@/stores/useUserStore'

async function deleteAccountFn() {
  const { data, error } = await supabase.functions.invoke('delete-account')
  if (error) {
    // FunctionsHttpError wraps the Response in .context — extract the real message
    let detail = error.message
    try {
      const ctx = (error as any).context
      if (ctx instanceof Response) {
        const body = await ctx.json()
        detail = body?.error ?? JSON.stringify(body)
      }
    } catch {}
    throw new Error(detail)
  }
  if (data?.error) throw new Error(data.error)
}

export function useDeleteAccount() {
  const clearUser = useUserStore((s) => s.clearUser)

  const mutation = useMutation({
    mutationFn: deleteAccountFn,
    onSuccess: () => {
      // Clear all local state before signing out
      useWorkoutStore.getState().endWorkout()
      useRestTimerStore.getState().reset()
      clearUser()
      signOut()
    },
  })

  return {
    deleteAccount: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  }
}
