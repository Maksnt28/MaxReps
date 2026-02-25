import type { SessionHistory } from './overload'

export interface LastSessionSummary {
  maxWeight: number
  setCount: number
  commonReps: number
}

export interface LastSessionData {
  /** Ghost values indexed by working set position (0-based) */
  lastSets: Map<number, { weightKg: number; reps: number }>
  summary: LastSessionSummary | null
}

/**
 * Transforms useExerciseHistory output into last-session display data.
 * Works with history.length >= 1 (unlike overload which requires >= 2).
 * Returns null only when history is empty.
 *
 * Sets are indexed by position (0-based array index, not set_number from DB)
 * to align with the current exercise's sequential set list. DB set_number can
 * have gaps from deleted sets, but ghost values need sequential mapping.
 */
export function getLastSessionData(
  history: SessionHistory[]
): LastSessionData | null {
  if (history.length === 0) return null

  // Last session is always history[0] (newest first per useExerciseHistory)
  const lastSession = history[0]
  const sets = lastSession.sets

  if (sets.length === 0) {
    return { lastSets: new Map(), summary: null }
  }

  // Build ghost values map indexed by position
  const lastSets = new Map<number, { weightKg: number; reps: number }>()
  for (let i = 0; i < sets.length; i++) {
    lastSets.set(i, { weightKg: sets[i].weightKg, reps: sets[i].reps })
  }

  // Summary: maxWeight, setCount, commonReps (mode)
  const maxWeight = Math.max(...sets.map((s) => s.weightKg))
  const setCount = sets.length

  // Mode: most common rep count. If all different, use last set's reps.
  const repCounts = new Map<number, number>()
  for (const s of sets) {
    repCounts.set(s.reps, (repCounts.get(s.reps) ?? 0) + 1)
  }
  let commonReps = sets[sets.length - 1].reps
  let maxFreq = 0
  for (const [reps, freq] of repCounts) {
    if (freq > maxFreq) {
      maxFreq = freq
      commonReps = reps
    }
  }

  return {
    lastSets,
    summary: { maxWeight, setCount, commonReps },
  }
}
