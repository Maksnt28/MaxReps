/**
 * Pure functions for weekly progress calculation.
 * Monday-start weeks (ISO 8601).
 */

/**
 * Get Monday 00:00:00 of the current week (local timezone).
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1 // days since Monday
  d.setDate(d.getDate() - diff)
  return d
}

/**
 * Get next Monday 00:00:00 after the given Monday.
 */
export function getNextMonday(monday: Date): Date {
  const d = new Date(monday)
  d.setDate(d.getDate() + 7)
  return d
}

/**
 * Given an array of finished_at timestamps, count distinct local-calendar days
 * that fall within [monday, nextMonday) and return which JS day indices (0-6) had workouts.
 *
 * Timestamps from Supabase are UTC. We convert to a local-date Date object
 * before calling getDay() so the weekday reflects the user's timezone.
 */
export function computeWeeklyDays(
  finishedAtDates: string[],
  monday: Date,
  nextMonday: Date,
): { daysCompleted: number; workoutDayNumbers: Set<number> } {
  const workoutDayNumbers = new Set<number>()

  for (const dateStr of finishedAtDates) {
    const d = new Date(dateStr)
    if (d >= monday && d < nextMonday) {
      // Build a local Date from the local year/month/date components
      // so getDay() returns the correct local weekday, not UTC weekday.
      const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      workoutDayNumbers.add(localDate.getDay()) // 0=Sun, 1=Mon, ...
    }
  }

  return { daysCompleted: workoutDayNumbers.size, workoutDayNumbers }
}

/**
 * Display order: Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6), Sun(0)
 */
export const WEEK_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const
