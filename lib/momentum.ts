import type { SessionHistory } from './overload'
import type { WorkoutSet } from '@/stores/useWorkoutStore'

export interface MomentumResult {
  percentage: number
  direction: 'up' | 'down' | 'even'
}

/**
 * Calculates session-wide momentum by comparing current completed working sets
 * against last session's sets on a position-matched basis.
 *
 * Position-based comparison: for each exercise, compares volume of the first N
 * completed working sets against the first N sets from last session (N = current
 * completed count). Aggregates across all exercises with data in both sessions.
 *
 * New exercises (no history) are excluded to avoid inflating momentum.
 * Aggregation is a simple sum — high-volume exercises naturally dominate.
 */
export function calculateMomentum(
  currentExercises: { exerciseId: string; sets: WorkoutSet[] }[],
  lastSessionMap: Map<string, SessionHistory[]>
): MomentumResult | null {
  let currentVolume = 0
  let lastVolume = 0
  let hasComparison = false

  for (const exercise of currentExercises) {
    const history = lastSessionMap.get(exercise.exerciseId)
    if (!history || history.length === 0) continue

    const lastSession = history[0]
    const lastSets = lastSession.sets
    if (lastSets.length === 0) continue

    // Current completed working sets only
    const currentWorkingSets = exercise.sets.filter(
      (s) => !s.isWarmup && s.isCompleted
    )
    if (currentWorkingSets.length === 0) continue

    // Position-matched comparison: first N sets where N = current completed count
    const compareCount = Math.min(currentWorkingSets.length, lastSets.length)

    for (let i = 0; i < compareCount; i++) {
      const currWeight = currentWorkingSets[i].weightKg ?? 0
      const currReps = currentWorkingSets[i].reps ?? 0
      currentVolume += currWeight * currReps

      lastVolume += lastSets[i].weightKg * lastSets[i].reps
    }

    hasComparison = true
  }

  if (!hasComparison || lastVolume === 0) return null

  const percentage = Math.round(((currentVolume - lastVolume) / lastVolume) * 100)

  return {
    percentage,
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'even',
  }
}
