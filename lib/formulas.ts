/**
 * Epley formula for estimated 1RM.
 * Clamps reps at 15 for accuracy (inaccurate above that).
 * Returns the weight itself for 1 rep.
 */
export function estimateMax1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  const clampedReps = Math.min(reps, 15)
  return Math.round(weight * (1 + clampedReps / 30))
}

/**
 * Format a volume number for display.
 * >= 10,000 → "12.4t" style. Otherwise locale-formatted kg.
 */
export function formatVolume(kg: number, locale: string = 'en'): string {
  if (kg >= 10_000) {
    const tonnes = kg / 1000
    // One decimal place
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(tonnes)
    return `${formatted}t`
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(kg)} kg`
}

/**
 * Group daily data points into weekly buckets.
 * Each week bucket sums the `value` field and uses the Monday date as key.
 */
export function groupByWeek<T extends { date: string; value: number }>(
  data: T[]
): { date: string; value: number }[] {
  const weekMap = new Map<string, number>()

  for (const item of data) {
    const d = new Date(item.date)
    // Get Monday of this week (ISO 8601)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    const key = monday.toISOString().split('T')[0]

    weekMap.set(key, (weekMap.get(key) ?? 0) + item.value)
  }

  return Array.from(weekMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Get date string N days ago from today */
export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

/** Map time range key to number of days */
export function rangeToDays(range: string): number {
  switch (range) {
    case '1W': return 7
    case '1M': return 30
    case '3M': return 90
    case '6M': return 180
    case '1Y': return 365
    default: return 30
  }
}

/** Whether a range needs weekly downsampling */
export function needsWeeklyDownsample(range: string): boolean {
  return range === '6M' || range === '1Y'
}
