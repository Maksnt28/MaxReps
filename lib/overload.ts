export interface OverloadSuggestion {
  type: 'increase' | 'deload'
  weight: number
  reps: number
  reason: string
}

export interface SessionHistory {
  startedAt: string
  sets: { weightKg: number; reps: number; rpe: number | null }[]
}

export const UPPER_BODY_MUSCLES = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'abs',
] as const

export const LOWER_BODY_MUSCLES = [
  'quads',
  'hamstrings',
  'glutes',
  'calves',
] as const

const LOWER_BODY_SET = new Set<string>(LOWER_BODY_MUSCLES)

const MS_PER_DAY = 86_400_000
const MAX_GAP_DAYS = 30

export function getWeightIncrement(musclePrimary: string): number {
  return LOWER_BODY_SET.has(musclePrimary) ? 5 : 2.5
}

export function roundToPlate(weight: number): number {
  return Math.round(weight / 2.5) * 2.5
}

function getRpeCoverage(sessions: SessionHistory[]): number {
  let withRpe = 0
  let total = 0
  for (const session of sessions) {
    for (const s of session.sets) {
      total++
      if (s.rpe != null) withRpe++
    }
  }
  return total === 0 ? 0 : withRpe / total
}

function avgRpe(sessions: SessionHistory[]): number[] {
  return sessions.map((session) => {
    const rpeValues = session.sets.filter((s) => s.rpe != null).map((s) => s.rpe!)
    if (rpeValues.length === 0) return 0
    return rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
  })
}

function allSetsHitTarget(session: SessionHistory, targetReps: number): boolean {
  return session.sets.length > 0 && session.sets.every((s) => s.reps >= targetReps)
}

function missedByTwoOrMore(session: SessionHistory, targetReps: number): number {
  if (session.sets.length === 0) return 0
  return session.sets.filter((s) => s.reps < targetReps - 1).length / session.sets.length
}

export function computeOverloadSuggestion(
  history: SessionHistory[],
  targetReps: number | null,
  musclePrimary: string
): OverloadSuggestion | null {
  // Pre-validation: need at least 2 sessions
  if (history.length < 2) return null

  const [newest, older] = history

  // Pre-validation: gap > 30 days
  const gap = Math.abs(
    new Date(newest.startedAt).getTime() - new Date(older.startedAt).getTime()
  )
  if (gap > MAX_GAP_DAYS * MS_PER_DAY) return null

  // Pre-validation: either session has zero valid sets
  if (newest.sets.length === 0 || older.sets.length === 0) return null

  // Resolve target reps: program-provided or implicit from older session
  const resolvedTarget = targetReps ?? older.sets[0].reps

  // Baseline weight = newest session's first working set
  const baselineWeight = newest.sets[0].weightKg
  const increment = getWeightIncrement(musclePrimary)

  // Determine tier based on RPE coverage
  const rpeCoverage = getRpeCoverage([newest, older])

  if (rpeCoverage >= 0.8) {
    // Tier 1: With RPE
    const [newestAvgRpe, olderAvgRpe] = avgRpe([newest, older])

    // Increase: avg RPE <= 7 in both + all sets hit target in both
    if (
      newestAvgRpe <= 7 &&
      olderAvgRpe <= 7 &&
      allSetsHitTarget(newest, resolvedTarget) &&
      allSetsHitTarget(older, resolvedTarget)
    ) {
      return {
        type: 'increase',
        weight: roundToPlate(baselineWeight + increment),
        reps: resolvedTarget,
        reason: `RPE avg ≤7 and all sets hit ${resolvedTarget} reps in both sessions`,
      }
    }

    // Deload: avg RPE >= 9 in both sessions
    if (newestAvgRpe >= 9 && olderAvgRpe >= 9) {
      return {
        type: 'deload',
        weight: roundToPlate(baselineWeight * 0.9),
        reps: resolvedTarget,
        reason: `RPE avg ≥9 in both sessions`,
      }
    }
  } else {
    // Tier 2: Without RPE / Mixed
    // Increase: all sets hit/exceeded target in both sessions
    if (
      allSetsHitTarget(newest, resolvedTarget) &&
      allSetsHitTarget(older, resolvedTarget)
    ) {
      return {
        type: 'increase',
        weight: roundToPlate(baselineWeight + increment),
        reps: resolvedTarget,
        reason: `All sets hit ${resolvedTarget} reps in both sessions (no RPE)`,
      }
    }

    // Deload: >=50% of sets missed by >=2 reps in both sessions
    if (
      missedByTwoOrMore(newest, resolvedTarget) >= 0.5 &&
      missedByTwoOrMore(older, resolvedTarget) >= 0.5
    ) {
      return {
        type: 'deload',
        weight: roundToPlate(baselineWeight * 0.9),
        reps: resolvedTarget,
        reason: `≥50% of sets missed target by ≥2 reps in both sessions`,
      }
    }
  }

  // Ambiguous — no suggestion
  return null
}
