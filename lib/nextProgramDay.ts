/**
 * Pure functions for next-program-day logic.
 * Extracted from the hook for testability (no RN/Supabase deps).
 */

/**
 * Given sorted day IDs and the last completed program_day_id,
 * return the 0-based index of the next day to do.
 * Cycles back to 0 after the last day.
 */
export function getNextDayIndex(
  dayIds: string[],
  lastCompletedDayId: string | null,
): number {
  if (dayIds.length === 0) return -1
  if (!lastCompletedDayId) return 0

  const lastIndex = dayIds.indexOf(lastCompletedDayId)
  if (lastIndex === -1) return 0

  return (lastIndex + 1) % dayIds.length
}

/**
 * Build a map of dayId → most recent started_at ISO string for completed sessions.
 * Only includes day IDs present in the dayIds array.
 */
export function buildDayCompletions(
  sessions: { program_day_id: string | null; started_at: string }[],
  dayIds: string[],
): Record<string, string> {
  const daySet = new Set(dayIds)
  const result: Record<string, string> = {}

  for (const s of sessions) {
    if (!s.program_day_id || !daySet.has(s.program_day_id)) continue
    const existing = result[s.program_day_id]
    if (!existing || s.started_at > existing) {
      result[s.program_day_id] = s.started_at
    }
  }

  return result
}

/**
 * Estimate workout duration in minutes.
 * Formula: totalSets x (restSeconds + 40s working time) / 60, rounded to nearest 5, min 5.
 */
export function estimateDuration(
  exercises: { sets_target: number; rest_seconds: number | null }[],
): number {
  const totalSets = exercises.reduce((sum, e) => sum + e.sets_target, 0)
  if (totalSets === 0) return 0

  const totalSeconds = exercises.reduce((sum, e) => {
    const rest = e.rest_seconds ?? 90
    return sum + e.sets_target * (rest + 40)
  }, 0)

  const raw = totalSeconds / 60
  const rounded = Math.round(raw / 5) * 5
  return Math.max(5, rounded)
}
