import { describe, it, expect } from 'vitest'
import { getNextDayIndex, estimateDuration, buildDayCompletions } from '../../lib/nextProgramDay'

describe('getNextDayIndex', () => {
  const dayIds = ['day-1', 'day-2', 'day-3', 'day-4']

  it('returns 0 (day 1) when no sessions exist', () => {
    expect(getNextDayIndex(dayIds, null)).toBe(0)
  })

  it('returns next day after last completed', () => {
    expect(getNextDayIndex(dayIds, 'day-2')).toBe(2)
  })

  it('cycles to day 1 after completing the last day', () => {
    expect(getNextDayIndex(dayIds, 'day-4')).toBe(0)
  })

  it('returns 0 when last completed day is not in list', () => {
    expect(getNextDayIndex(dayIds, 'unknown-id')).toBe(0)
  })

  it('returns -1 for empty day list', () => {
    expect(getNextDayIndex([], null)).toBe(-1)
  })

  it('cycles correctly with a single-day program', () => {
    expect(getNextDayIndex(['only-day'], 'only-day')).toBe(0)
  })
})

describe('buildDayCompletions', () => {
  const dayIds = ['day-1', 'day-2', 'day-3']

  it('returns empty record for empty sessions', () => {
    expect(buildDayCompletions([], dayIds)).toEqual({})
  })

  it('keeps most recent started_at when multiple sessions per day', () => {
    const sessions = [
      { program_day_id: 'day-1', started_at: '2026-02-20T10:00:00Z' },
      { program_day_id: 'day-1', started_at: '2026-02-25T10:00:00Z' },
      { program_day_id: 'day-1', started_at: '2026-02-22T10:00:00Z' },
    ]
    const result = buildDayCompletions(sessions, dayIds)
    expect(result).toEqual({ 'day-1': '2026-02-25T10:00:00Z' })
  })

  it('ignores sessions with null program_day_id', () => {
    const sessions = [
      { program_day_id: null, started_at: '2026-02-20T10:00:00Z' },
      { program_day_id: 'day-2', started_at: '2026-02-21T10:00:00Z' },
    ]
    const result = buildDayCompletions(sessions, dayIds)
    expect(result).toEqual({ 'day-2': '2026-02-21T10:00:00Z' })
  })

  it('ignores sessions with unknown day IDs', () => {
    const sessions = [
      { program_day_id: 'unknown-day', started_at: '2026-02-20T10:00:00Z' },
      { program_day_id: 'day-3', started_at: '2026-02-21T10:00:00Z' },
    ]
    const result = buildDayCompletions(sessions, dayIds)
    expect(result).toEqual({ 'day-3': '2026-02-21T10:00:00Z' })
  })

  it('handles single session correctly', () => {
    const sessions = [
      { program_day_id: 'day-1', started_at: '2026-02-20T10:00:00Z' },
    ]
    const result = buildDayCompletions(sessions, dayIds)
    expect(result).toEqual({ 'day-1': '2026-02-20T10:00:00Z' })
  })
})

describe('estimateDuration', () => {
  it('returns 0 for empty exercises', () => {
    expect(estimateDuration([])).toBe(0)
  })

  it('returns 0 when total sets is 0', () => {
    expect(estimateDuration([{ sets_target: 0, rest_seconds: 90 }])).toBe(0)
  })

  it('uses 90s default rest when rest_seconds is null', () => {
    // 3 sets × (90 + 40) = 390s = 6.5min → rounded to 5
    const result = estimateDuration([{ sets_target: 3, rest_seconds: null }])
    expect(result).toBe(5)
  })

  it('computes duration with multiple exercises', () => {
    // Exercise 1: 4 sets × (90 + 40) = 520s
    // Exercise 2: 3 sets × (120 + 40) = 480s
    // Total: 1000s = 16.67min → rounded to 15
    const result = estimateDuration([
      { sets_target: 4, rest_seconds: 90 },
      { sets_target: 3, rest_seconds: 120 },
    ])
    expect(result).toBe(15)
  })

  it('returns minimum of 5 minutes', () => {
    // 1 set × (30 + 40) = 70s = 1.17min → rounded to 0, but floor is 5
    const result = estimateDuration([{ sets_target: 1, rest_seconds: 30 }])
    expect(result).toBe(5)
  })
})
