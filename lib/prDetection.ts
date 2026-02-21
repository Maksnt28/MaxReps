/**
 * PR (Personal Record) Detection Logic
 * =====================================
 * A PR is a new all-time max WEIGHT for a given exercise.
 *
 * Rules:
 * 1. Only non-warmup sets with weight > 0 are eligible.
 * 2. For each exercise, we compare the set's weight_kg against the historical
 *    maximum weight_kg ever lifted for that exercise (from all previous workouts).
 * 3. If weight_kg > historicalMax → it's a PR.
 * 4. First-ever set for an exercise (no history) is always a PR (historicalMax = 0).
 * 5. Within a single workout, if multiple sets beat the historical max,
 *    each new high is marked as a PR (e.g., 105kg then 110kg = two PRs).
 * 6. Duplicate same-weight sets within a workout only count once.
 *
 * Note: This is a weight-only PR. Reps-based PRs (e.g., most reps at a given
 * weight) are deferred to a future version.
 */
export function detectPRs(
  sets: { exerciseId: string; weightKg: number | null; isWarmup: boolean }[],
  historyMap: Record<string, number> // exerciseId → max weight_kg
): Set<string> {
  // Track best weight seen so far per exercise within this workout
  // to avoid marking multiple sets at same weight as PR
  const bestInWorkout: Record<string, number> = {}
  const prKeys = new Set<string>()

  for (const s of sets) {
    if (s.isWarmup || !s.weightKg || s.weightKg <= 0) continue

    const historicalMax = historyMap[s.exerciseId] ?? 0
    const workoutMax = bestInWorkout[s.exerciseId] ?? 0

    if (s.weightKg > historicalMax && s.weightKg > workoutMax) {
      // Only the heaviest set in the workout gets the PR for this exercise
      prKeys.add(`${s.exerciseId}:${s.weightKg}`)
      bestInWorkout[s.exerciseId] = s.weightKg
    } else if (s.weightKg > historicalMax && s.weightKg === workoutMax) {
      // Same weight already marked as PR — skip duplicate
    } else if (s.weightKg > workoutMax) {
      bestInWorkout[s.exerciseId] = s.weightKg
    }
  }

  return prKeys
}
