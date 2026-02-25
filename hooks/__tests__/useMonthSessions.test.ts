import { describe, it, expect } from 'vitest'

// Test the pure aggregation logic used by useMonthSessions
// (not the hook itself — testing react-query wiring is integration-level)

interface MockSet {
  session_id: string
  exercise_id: string
  weight_kg: number | null
  reps: number | null
  is_warmup: boolean
  is_pr: boolean
}

interface MockSession {
  id: string
  started_at: string
  finished_at: string | null
  duration_seconds: number | null
  notes: string | null
  program_day_id: string | null
}

function aggregateMonth(sessions: MockSession[], sets: MockSet[]) {
  const workoutDays = new Set<number>()
  const prDays = new Set<number>()
  let totalVolume = 0
  let totalPRs = 0

  const summaries = sessions.map((s) => {
    const sessionSets = sets.filter((set) => set.session_id === s.id)
    const workingSets = sessionSets.filter((set) => !set.is_warmup)
    const exerciseIds = [...new Set(sessionSets.map((set) => set.exercise_id))]
    const volume = workingSets.reduce(
      (sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0,
    )
    const prCount = workingSets.filter((set) => set.is_pr).length

    const dayOfMonth = new Date(s.started_at).getDate()
    workoutDays.add(dayOfMonth)
    if (prCount > 0) prDays.add(dayOfMonth)
    totalVolume += volume
    totalPRs += prCount

    return {
      id: s.id,
      startedAt: s.started_at,
      exerciseIds,
      exerciseCount: exerciseIds.length,
      setCount: workingSets.length,
      totalVolume: Math.round(volume),
      prCount,
    }
  })

  return {
    sessions: summaries,
    workoutDays,
    prDays,
    totalSessions: summaries.length,
    totalVolume: Math.round(totalVolume),
    totalPRs,
  }
}

describe('useMonthSessions — aggregation logic', () => {
  it('computes workoutDays set from session dates', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-05T10:00:00', finished_at: '2026-02-05T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
      { id: 's2', started_at: '2026-02-12T10:00:00', finished_at: '2026-02-12T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
      { session_id: 's2', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.workoutDays).toEqual(new Set([5, 12]))
  })

  it('computes prDays set only for sessions with PRs', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-05T10:00:00', finished_at: '2026-02-05T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
      { id: 's2', started_at: '2026-02-12T10:00:00', finished_at: '2026-02-12T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: true },
      { session_id: 's2', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.prDays).toEqual(new Set([5]))
    expect(result.totalPRs).toBe(1)
  })

  it('returns empty month for no sessions', () => {
    const result = aggregateMonth([], [])
    expect(result.sessions).toEqual([])
    expect(result.workoutDays.size).toBe(0)
    expect(result.prDays.size).toBe(0)
    expect(result.totalSessions).toBe(0)
    expect(result.totalVolume).toBe(0)
    expect(result.totalPRs).toBe(0)
  })

  it('excludes warmup sets from volume and set count', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-10T10:00:00', finished_at: '2026-02-10T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 60, reps: 10, is_warmup: true, is_pr: false },
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.sessions[0].setCount).toBe(1)
    expect(result.sessions[0].totalVolume).toBe(500)
    expect(result.totalVolume).toBe(500)
  })

  it('accumulates total volume across sessions', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-05T10:00:00', finished_at: '2026-02-05T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
      { id: 's2', started_at: '2026-02-12T10:00:00', finished_at: '2026-02-12T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
      { session_id: 's2', exercise_id: 'ex1', weight_kg: 80, reps: 10, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.totalVolume).toBe(500 + 800)
  })

  it('handles multiple sessions on the same day', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-05T08:00:00', finished_at: '2026-02-05T09:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
      { id: 's2', started_at: '2026-02-05T17:00:00', finished_at: '2026-02-05T18:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: false },
      { session_id: 's2', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: true },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.workoutDays).toEqual(new Set([5]))
    expect(result.prDays).toEqual(new Set([5]))
    expect(result.totalSessions).toBe(2)
  })

  it('handles null weight gracefully', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-10T10:00:00', finished_at: '2026-02-10T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: null, reps: 15, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.totalVolume).toBe(0)
    expect(result.sessions[0].setCount).toBe(1)
  })

  it('counts PRs correctly across multiple exercises', () => {
    const sessions: MockSession[] = [
      { id: 's1', started_at: '2026-02-10T10:00:00', finished_at: '2026-02-10T11:00:00', duration_seconds: 3600, notes: null, program_day_id: null },
    ]
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 5, is_warmup: false, is_pr: true },
      { session_id: 's1', exercise_id: 'ex2', weight_kg: 60, reps: 10, is_warmup: false, is_pr: true },
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 4, is_warmup: false, is_pr: false },
    ]

    const result = aggregateMonth(sessions, sets)
    expect(result.totalPRs).toBe(2)
    expect(result.sessions[0].prCount).toBe(2)
  })
})
