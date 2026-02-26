import { useWorkoutStore } from '@/stores/useWorkoutStore'
import { validateOrphanedSession } from '@/lib/workoutRecovery'

/**
 * Validates persisted workout state on cold start.
 * If the DB session row was deleted but local state persists, silently clears it.
 * Network failures result in a no-op (assume session is valid).
 */
export async function checkWorkoutRecovery(): Promise<void> {
  try {
    // Wait for Zustand persist rehydration from AsyncStorage
    if (!useWorkoutStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        useWorkoutStore.persist.onFinishHydration(() => resolve())
      })
    }

    const { isActive, sessionId } = useWorkoutStore.getState()
    if (!isActive || !sessionId) return

    const result = await validateOrphanedSession(sessionId)
    if (result === 'orphaned') {
      useWorkoutStore.getState().endWorkout()
    }
  } catch (e) {
    // Never block app init — swallow errors
    console.warn('checkWorkoutRecovery: error', e)
  }
}
