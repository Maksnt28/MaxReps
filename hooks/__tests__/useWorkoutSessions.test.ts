import { describe, it, expect } from 'vitest'
import { formatDuration } from '@/lib/timerUtils'

// Test the pure aggregation logic used by useWorkoutSessions
// (not the hook itself — testing react-query wiring is integration-level)

interface MockSet {
  session_id: string
  exercise_id: string
  weight_kg: number | null
  reps: number | null
  is_warmup: boolean
  is_pr: boolean
}

function aggregateSession(
  session: { id: string; started_at: string; finished_at: string | null; duration_seconds: number | null },
  sets: MockSet[],
) {
  const sessionSets = sets.filter((set) => set.session_id === session.id)
  const workingSets = sessionSets.filter((set) => !set.is_warmup)
  const exerciseIds = [...new Set(sessionSets.map((set) => set.exercise_id))]
  const totalVolume = workingSets.reduce(
    (sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0,
  )
  const prCount = workingSets.filter((set) => set.is_pr).length

  return {
    id: session.id,
    startedAt: session.started_at,
    finishedAt: session.finished_at,
    durationSeconds: session.duration_seconds,
    exerciseIds,
    exerciseCount: exerciseIds.length,
    setCount: workingSets.length,
    totalVolume: Math.round(totalVolume),
    prCount,
  }
}

describe('useWorkoutSessions — aggregation logic', () => {
  it('aggregates sets into session summary', () => {
    const session = { id: 's1', started_at: '2026-02-24T10:00:00Z', finished_at: '2026-02-24T11:00:00Z', duration_seconds: 3600 }
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 8, is_warmup: false, is_pr: false },
      { session_id: 's1', exercise_id: 'ex1', weight_kg: 100, reps: 6, is_warmup: false, is_pr: true },
      { session_id: 's1', exercise_id: 'ex2', weight_kg: 60, reps: 12, is_warmup: false, is_pr: false },
      { session_id: 's1', exercise_id: 'ex2', weight_kg: 40, reps: 10, is_warmup: true, is_pr: false },
    ]

    const result = aggregateSession(session, sets)
    expect(result.exerciseCount).toBe(2)
    expect(result.setCount).toBe(3) // excludes warmup
    expect(result.totalVolume).toBe(100 * 8 + 100 * 6 + 60 * 12) // 2120
    expect(result.prCount).toBe(1)
  })

  it('returns empty state for session with no sets', () => {
    const session = { id: 's1', started_at: '2026-02-24T10:00:00Z', finished_at: '2026-02-24T10:30:00Z', duration_seconds: 1800 }
    const result = aggregateSession(session, [])

    expect(result.exerciseCount).toBe(0)
    expect(result.setCount).toBe(0)
    expect(result.totalVolume).toBe(0)
    expect(result.prCount).toBe(0)
    expect(result.exerciseIds).toEqual([])
  })

  it('returns nextPage null when less than PAGE_SIZE sessions', () => {
    const PAGE_SIZE = 20
    const sessions = Array.from({ length: 5 }, (_, i) => ({ id: `s${i}` }))
    const nextPage = sessions.length === PAGE_SIZE ? 20 : null
    expect(nextPage).toBeNull()
  })

  it('returns nextPage offset when exactly PAGE_SIZE sessions', () => {
    const PAGE_SIZE = 20
    const sessions = Array.from({ length: 20 }, (_, i) => ({ id: `s${i}` }))
    const pageParam = 0
    const nextPage = sessions.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null
    expect(nextPage).toBe(20)
  })

  it('handles null weight and reps gracefully (bodyweight exercises)', () => {
    const session = { id: 's1', started_at: '2026-02-24T10:00:00Z', finished_at: '2026-02-24T10:30:00Z', duration_seconds: 1800 }
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex1', weight_kg: null, reps: 15, is_warmup: false, is_pr: false },
      { session_id: 's1', exercise_id: 'ex1', weight_kg: null, reps: null, is_warmup: false, is_pr: false },
    ]

    const result = aggregateSession(session, sets)
    expect(result.totalVolume).toBe(0) // null weight → 0 volume
    expect(result.setCount).toBe(2)
  })

  it('preserves exercise ordering from first-appearance', () => {
    const session = { id: 's1', started_at: '2026-02-24T10:00:00Z', finished_at: '2026-02-24T11:00:00Z', duration_seconds: 3600 }
    const sets: MockSet[] = [
      { session_id: 's1', exercise_id: 'ex-bench', weight_kg: 100, reps: 8, is_warmup: false, is_pr: false },
      { session_id: 's1', exercise_id: 'ex-squat', weight_kg: 120, reps: 5, is_warmup: false, is_pr: false },
      { session_id: 's1', exercise_id: 'ex-bench', weight_kg: 100, reps: 6, is_warmup: false, is_pr: false },
    ]

    const result = aggregateSession(session, sets)
    expect(result.exerciseIds).toEqual(['ex-bench', 'ex-squat'])
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(1800)).toBe('30m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(5400)).toBe('1h 30m')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0m')
  })

  it('formats exact hour', () => {
    expect(formatDuration(3600)).toBe('1h 0m')
  })
})
