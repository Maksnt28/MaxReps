import { describe, it, expect } from 'vitest'
import {
  computeStrengthPoints,
  computeVolumePoints,
  computeFrequencyPoints,
  type SessionRow,
  type SetRow,
} from '../chartTransforms'

// ── computeStrengthPoints ─────────────────────────────────

describe('computeStrengthPoints', () => {
  const sessions: SessionRow[] = [
    { id: 's1', started_at: '2026-02-10T10:00:00Z' },
    { id: 's2', started_at: '2026-02-12T10:00:00Z' },
  ]

  it('selects best 1RM per session', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 5 },  // e1RM = 117
      { session_id: 's1', weight_kg: 80, reps: 10 },   // e1RM = 107
      { session_id: 's2', weight_kg: 110, reps: 3 },   // e1RM = 121
    ]

    const result = computeStrengthPoints(sessions, sets, '1M')
    expect(result).toHaveLength(2)
    expect(result[0].estimatedMax1RM).toBe(117) // session s1
    expect(result[1].estimatedMax1RM).toBe(121) // session s2
  })

  it('skips sets with null weight or reps', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: null, reps: 5 },
      { session_id: 's1', weight_kg: 100, reps: null },
      { session_id: 's2', weight_kg: 80, reps: 8 },
    ]

    const result = computeStrengthPoints(sessions, sets, '1M')
    expect(result).toHaveLength(1) // only s2 has valid data
    expect(result[0].date).toBe('2026-02-12')
  })

  it('returns points sorted by date ascending', () => {
    const reversedSessions: SessionRow[] = [
      { id: 's2', started_at: '2026-02-12T10:00:00Z' },
      { id: 's1', started_at: '2026-02-10T10:00:00Z' },
    ]
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 5 },
      { session_id: 's2', weight_kg: 110, reps: 3 },
    ]

    const result = computeStrengthPoints(reversedSessions, sets, '1M')
    expect(result[0].date).toBe('2026-02-10')
    expect(result[1].date).toBe('2026-02-12')
  })

  it('downsamples to weekly for 6M range', () => {
    // Two sessions in the same week
    const weeklySessions: SessionRow[] = [
      { id: 's1', started_at: '2026-02-09T10:00:00Z' }, // Monday
      { id: 's2', started_at: '2026-02-11T10:00:00Z' }, // Wednesday (same week)
    ]
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 5 },  // e1RM = 117
      { session_id: 's2', weight_kg: 110, reps: 3 },  // e1RM = 121
    ]

    const result = computeStrengthPoints(weeklySessions, sets, '6M')
    // Should be downsampled to 1 weekly point (sum = 238, which is groupByWeek summing)
    expect(result).toHaveLength(1)
  })

  it('does not downsample for 1M range', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 5 },
      { session_id: 's2', weight_kg: 110, reps: 3 },
    ]

    const result = computeStrengthPoints(sessions, sets, '1M')
    expect(result).toHaveLength(2) // daily granularity
  })

  it('returns empty for empty sessions', () => {
    expect(computeStrengthPoints([], [], '1M')).toEqual([])
  })

  it('returns empty for empty sets', () => {
    expect(computeStrengthPoints(sessions, [], '1M')).toEqual([])
  })

  it('returns correct data for single session with one set', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 60, reps: 10 }, // e1RM = 80
    ]

    const result = computeStrengthPoints([sessions[0]], sets, '1M')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      date: '2026-02-10',
      estimatedMax1RM: 80,
      bestSetWeight: 60,
      bestSetReps: 10,
    })
  })
})

// ── computeVolumePoints ───────────────────────────────────

describe('computeVolumePoints', () => {
  const sessions: SessionRow[] = [
    { id: 's1', started_at: '2026-02-10T10:00:00Z' },
    { id: 's2', started_at: '2026-02-12T10:00:00Z' },
  ]

  it('computes volume per session correctly', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 8 },   // 800
      { session_id: 's1', weight_kg: 100, reps: 6 },   // 600
      { session_id: 's2', weight_kg: 60, reps: 12 },   // 720
    ]

    const result = computeVolumePoints(sessions, sets, '1M')
    expect(result).toHaveLength(2)
    expect(result[0].totalVolume).toBe(1400) // s1: 800 + 600
    expect(result[1].totalVolume).toBe(720)  // s2
  })

  it('treats null weight/reps as 0', () => {
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: null, reps: 15 },   // 0 × 15 = 0
      { session_id: 's1', weight_kg: 100, reps: null },   // 100 × 0 = 0
    ]

    const result = computeVolumePoints(sessions, sets, '1M')
    expect(result).toHaveLength(1)
    expect(result[0].totalVolume).toBe(0)
  })

  it('returns sorted by date', () => {
    const reversed: SessionRow[] = [
      { id: 's2', started_at: '2026-02-12T10:00:00Z' },
      { id: 's1', started_at: '2026-02-10T10:00:00Z' },
    ]
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 10 },
      { session_id: 's2', weight_kg: 50, reps: 10 },
    ]

    const result = computeVolumePoints(reversed, sets, '1M')
    expect(result[0].date).toBe('2026-02-10')
    expect(result[1].date).toBe('2026-02-12')
  })

  it('downsamples to weekly for 1Y range', () => {
    // Two sessions in the same week
    const weeklySessions: SessionRow[] = [
      { id: 's1', started_at: '2026-02-09T10:00:00Z' },
      { id: 's2', started_at: '2026-02-11T10:00:00Z' },
    ]
    const sets: SetRow[] = [
      { session_id: 's1', weight_kg: 100, reps: 10 }, // 1000
      { session_id: 's2', weight_kg: 80, reps: 10 },  // 800
    ]

    const result = computeVolumePoints(weeklySessions, sets, '1Y')
    expect(result).toHaveLength(1)
    expect(result[0].totalVolume).toBe(1800) // 1000 + 800
  })

  it('returns empty for empty sessions', () => {
    expect(computeVolumePoints([], [], '1M')).toEqual([])
  })

  it('returns empty for sessions with no matching sets', () => {
    const result = computeVolumePoints(sessions, [], '1M')
    expect(result).toEqual([])
  })
})

// ── computeFrequencyPoints ────────────────────────────────

describe('computeFrequencyPoints', () => {
  it('counts sessions per date', () => {
    const sessions = [
      { started_at: '2026-02-10T09:00:00Z' },
      { started_at: '2026-02-10T18:00:00Z' }, // same day
      { started_at: '2026-02-12T10:00:00Z' },
    ]

    const result = computeFrequencyPoints(sessions)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2026-02-10', count: 2 })
    expect(result[1]).toEqual({ date: '2026-02-12', count: 1 })
  })

  it('returns sorted by date ascending', () => {
    const sessions = [
      { started_at: '2026-02-15T10:00:00Z' },
      { started_at: '2026-02-10T10:00:00Z' },
    ]

    const result = computeFrequencyPoints(sessions)
    expect(result[0].date).toBe('2026-02-10')
    expect(result[1].date).toBe('2026-02-15')
  })

  it('returns empty for empty sessions', () => {
    expect(computeFrequencyPoints([])).toEqual([])
  })

  it('handles single session', () => {
    const result = computeFrequencyPoints([{ started_at: '2026-02-10T10:00:00Z' }])
    expect(result).toEqual([{ date: '2026-02-10', count: 1 }])
  })

  it('counts multiple workouts on one day', () => {
    const sessions = [
      { started_at: '2026-02-10T06:00:00Z' },
      { started_at: '2026-02-10T12:00:00Z' },
      { started_at: '2026-02-10T18:00:00Z' },
    ]

    const result = computeFrequencyPoints(sessions)
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(3)
  })
})
