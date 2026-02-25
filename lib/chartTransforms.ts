import { estimateMax1RM, needsWeeklyDownsample, groupByWeek } from './formulas'

// ── Axis Scale ────────────────────────────────────────────

/**
 * Compute nice Y-axis scale where all labels end in 0 or 5.
 * Uses "nice numbers" algorithm: steps from [1, 2, 2.5, 5, 10] × magnitude.
 */
export function niceAxisScale(dataMax: number): {
  maxValue: number
  stepValue: number
  noOfSections: number
} {
  if (dataMax <= 0) return { maxValue: 100, stepValue: 25, noOfSections: 4 }

  const rawStep = dataMax / 4
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * magnitude)

  for (const step of candidates) {
    if (step < 5) continue // ensure labels end in 0 or 5
    const maxVal = Math.ceil(dataMax / step) * step
    const sections = Math.round(maxVal / step)
    if (sections >= 3 && sections <= 5) {
      return { maxValue: maxVal, stepValue: step, noOfSections: sections }
    }
  }

  // Fallback for very small values
  const fallbackStep = 5
  const fallbackMax = Math.max(
    Math.ceil(dataMax / fallbackStep) * fallbackStep,
    fallbackStep * 4
  )
  return {
    maxValue: fallbackMax,
    stepValue: fallbackStep,
    noOfSections: fallbackMax / fallbackStep,
  }
}

// ── Types ─────────────────────────────────────────────────

export type SessionRow = { id: string; started_at: string }
export type SetRow = { session_id: string; weight_kg: number | null; reps: number | null }

export type StrengthDataPoint = {
  date: string
  estimatedMax1RM: number
  bestSetWeight: number
  bestSetReps: number
}

export type VolumeDataPoint = {
  date: string
  totalVolume: number
}

export type FrequencyDataPoint = {
  date: string
  count: number
}

// ── Strength ──────────────────────────────────────────────

/**
 * From raw sessions + sets, compute the best estimated 1RM per session.
 * Optionally downsamples to weekly for long ranges.
 */
export function computeStrengthPoints(
  sessions: SessionRow[],
  sets: SetRow[],
  range: string
): StrengthDataPoint[] {
  if (sessions.length === 0 || sets.length === 0) return []

  // Build session date map
  const sessionDateMap = new Map<string, string>()
  for (const s of sessions) {
    sessionDateMap.set(s.id, s.started_at.split('T')[0])
  }

  // Group sets by session, find best 1RM per session
  const sessionBest = new Map<string, { e1rm: number; weight: number; reps: number }>()
  for (const set of sets) {
    if (!set.weight_kg || !set.reps) continue
    const e1rm = estimateMax1RM(set.weight_kg, set.reps)
    const current = sessionBest.get(set.session_id)
    if (!current || e1rm > current.e1rm) {
      sessionBest.set(set.session_id, {
        e1rm,
        weight: set.weight_kg,
        reps: set.reps,
      })
    }
  }

  let points: StrengthDataPoint[] = []
  for (const [sessionId, best] of sessionBest) {
    const date = sessionDateMap.get(sessionId)
    if (!date) continue
    points.push({
      date,
      estimatedMax1RM: best.e1rm,
      bestSetWeight: best.weight,
      bestSetReps: best.reps,
    })
  }

  points.sort((a, b) => a.date.localeCompare(b.date))

  // Downsample to weekly for 6M/1Y
  if (needsWeeklyDownsample(range)) {
    const weekly = groupByWeek(
      points.map((p) => ({ date: p.date, value: p.estimatedMax1RM }))
    )
    return weekly.map((w) => ({
      date: w.date,
      estimatedMax1RM: w.value,
      bestSetWeight: 0,
      bestSetReps: 0,
    }))
  }

  return points
}

// ── Volume ────────────────────────────────────────────────

/**
 * From raw sessions + sets, compute Σ(weight×reps) per session.
 * Optionally downsamples to weekly for long ranges.
 */
export function computeVolumePoints(
  sessions: SessionRow[],
  sets: SetRow[],
  range: string
): VolumeDataPoint[] {
  if (sessions.length === 0) return []

  // Build session date map
  const sessionDateMap = new Map<string, string>()
  for (const s of sessions) {
    sessionDateMap.set(s.id, s.started_at.split('T')[0])
  }

  // Compute volume per session: Σ(weight_kg × reps)
  const sessionVolume = new Map<string, number>()
  for (const set of sets) {
    const vol = (set.weight_kg ?? 0) * (set.reps ?? 0)
    sessionVolume.set(set.session_id, (sessionVolume.get(set.session_id) ?? 0) + vol)
  }

  let points: VolumeDataPoint[] = []
  for (const [sessionId, totalVolume] of sessionVolume) {
    const date = sessionDateMap.get(sessionId)
    if (!date) continue
    points.push({ date, totalVolume })
  }

  points.sort((a, b) => a.date.localeCompare(b.date))

  // Downsample to weekly for 6M/1Y
  if (needsWeeklyDownsample(range)) {
    const weekly = groupByWeek(
      points.map((p) => ({ date: p.date, value: p.totalVolume }))
    )
    return weekly.map((w) => ({ date: w.date, totalVolume: w.value }))
  }

  return points
}

// ── Frequency ─────────────────────────────────────────────

/**
 * From raw sessions, count workouts per date.
 */
export function computeFrequencyPoints(
  sessions: { started_at: string }[]
): FrequencyDataPoint[] {
  if (sessions.length === 0) return []

  const dateCount = new Map<string, number>()
  for (const s of sessions) {
    const date = s.started_at.split('T')[0]
    dateCount.set(date, (dateCount.get(date) ?? 0) + 1)
  }

  return Array.from(dateCount.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
