/**
 * Pure functions for workout streak calculation.
 * Streaks are measured in consecutive ISO weeks (Mon–Sun) with ≥1 session.
 * Uses Monday-normalization approach (year-boundary safe).
 */

/**
 * Get the Monday of the ISO week containing the given date (local timezone).
 * Returns date string YYYY-MM-DD for easy Set comparison.
 */
export function mondayOf(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Compute current and longest streak from a list of session started_at timestamps.
 */
export function computeStreaks(
  startedAtDates: string[],
): { currentStreak: number; longestStreak: number; totalWeeksActive: number } {
  if (startedAtDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalWeeksActive: 0 }
  }

  // Collect unique Mondays
  const mondaySet = new Set<string>()
  for (const dateStr of startedAtDates) {
    mondaySet.add(mondayOf(new Date(dateStr)))
  }

  const totalWeeksActive = mondaySet.size

  // Sort Mondays descending (most recent first)
  const sortedMondays = [...mondaySet].sort((a, b) => b.localeCompare(a))

  // Helper: add 7 days to a Monday date string
  function addWeek(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Helper: subtract 7 days
  function subWeek(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Current streak: start from current week or last week
  const currentMonday = mondayOf(new Date())
  let startMonday: string
  if (mondaySet.has(currentMonday)) {
    startMonday = currentMonday
  } else {
    startMonday = subWeek(currentMonday)
  }

  let currentStreak = 0
  if (mondaySet.has(startMonday)) {
    currentStreak = 1
    let check = subWeek(startMonday)
    while (mondaySet.has(check)) {
      currentStreak++
      check = subWeek(check)
    }
  }

  // Longest streak: scan sorted Mondays ascending
  const ascending = [...sortedMondays].reverse()
  let longestStreak = 0
  let runLength = 1

  for (let i = 1; i < ascending.length; i++) {
    if (addWeek(ascending[i - 1]) === ascending[i]) {
      runLength++
    } else {
      longestStreak = Math.max(longestStreak, runLength)
      runLength = 1
    }
  }
  longestStreak = Math.max(longestStreak, runLength)

  return { currentStreak, longestStreak, totalWeeksActive }
}

/**
 * Milestone thresholds and their i18n keys.
 */
export const STREAK_MILESTONES: { weeks: number; key: string }[] = [
  { weeks: 52, key: 'home.milestone52' },
  { weeks: 26, key: 'home.milestone26' },
  { weeks: 12, key: 'home.milestone12' },
  { weeks: 8, key: 'home.milestone8' },
  { weeks: 4, key: 'home.milestone4' },
]

export function getMilestoneKey(weeks: number): string | null {
  for (const m of STREAK_MILESTONES) {
    if (weeks >= m.weeks) return m.key
  }
  return null
}
