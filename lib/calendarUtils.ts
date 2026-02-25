// =============================================================================
// Calendar Utilities — Pure functions for month-based workout history
// =============================================================================

/** Number of days in a given month (1-indexed), handles leap years */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Build a 2D grid for a calendar month.
 * Weeks start on Monday. Null cells for empty slots.
 * No adjacent-month days shown.
 */
export function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month)
  // Day of week for the 1st: 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const grid: (number | null)[][] = []
  let week: (number | null)[] = new Array(startOffset).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      grid.push(week)
      week = []
    }
  }

  // Pad last week with nulls
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    grid.push(week)
  }

  return grid
}

/** Format "February 2026" using Intl */
export function formatMonthYear(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
    new Date(year, month - 1, 1),
  )
}

/** Weekday headers Mon→Sun: ['M','T','W','T','F','S','S'] (EN) */
export function getWeekdayHeaders(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  // Generate Mon(0) through Sun(6) — use 2024-01-01 which is a Monday
  const headers: string[] = []
  for (let i = 0; i < 7; i++) {
    headers.push(formatter.format(new Date(2024, 0, 1 + i)))
  }
  return headers
}

/** Check if year/month is the current month */
export function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date()
  return year === now.getFullYear() && month === now.getMonth() + 1
}

/** Previous month with year wrapping */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

/** Next month with year wrapping */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}
