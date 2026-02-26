import { supabase } from './supabase'

/**
 * Check if a workout session still exists in the database.
 * Returns 'valid' if the row exists, 'orphaned' if it was deleted.
 */
export async function validateOrphanedSession(
  sessionId: string
): Promise<'valid' | 'orphaned'> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('id', sessionId)
    .maybeSingle()

  // Network/auth errors → assume valid (don't clear state on transient failures)
  if (error) return 'valid'

  return data ? 'valid' : 'orphaned'
}
