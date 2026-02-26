import { describe, it, expect, vi, afterEach } from 'vitest'
import { mondayOf, computeStreaks, getMilestoneKey } from '../streakCalculation'

describe('mondayOf', () => {
  it('returns Monday for a Monday', () => {
    expect(mondayOf(new Date(2026, 1, 23))).toBe('2026-02-23') // Monday
  })

  it('returns Monday for a Wednesday', () => {
    expect(mondayOf(new Date(2026, 1, 25))).toBe('2026-02-23')
  })

  it('returns Monday for a Sunday', () => {
    expect(mondayOf(new Date(2026, 2, 1))).toBe('2026-02-23') // Sun Mar 1 → Mon Feb 23
  })
})

describe('computeStreaks', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function fakeNow(dateStr: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(dateStr + 'T12:00:00'))
  }

  it('returns 0s for empty session list', () => {
    const result = computeStreaks([])
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, totalWeeksActive: 0 })
  })

  it('single session → current streak 1, longest 1', () => {
    fakeNow('2026-02-25') // Wednesday
    const result = computeStreaks(['2026-02-24T10:00:00']) // Tuesday this week
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('consecutive weeks → streak counts all', () => {
    fakeNow('2026-02-26') // Thursday
    // Sessions in 3 consecutive weeks
    const dates = [
      '2026-02-10T10:00:00', // Week of Feb 9
      '2026-02-17T10:00:00', // Week of Feb 16
      '2026-02-23T10:00:00', // Week of Feb 23 (current)
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })

  it('broken streak: gap in the middle', () => {
    fakeNow('2026-02-26')
    const dates = [
      '2026-02-02T10:00:00', // Week of Feb 2
      // Gap: week of Feb 9 missing
      '2026-02-17T10:00:00', // Week of Feb 16
      '2026-02-23T10:00:00', // Week of Feb 23 (current)
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(2)
    expect(result.longestStreak).toBe(2)
  })

  it('Monday morning edge case: no session this week, streak from last week', () => {
    fakeNow('2026-02-23') // Monday morning
    // 4 consecutive weeks, ending Sunday Feb 22
    const dates = [
      '2026-02-01T10:00:00', // Week of Jan 26
      '2026-02-03T10:00:00', // Week of Feb 2
      '2026-02-10T10:00:00', // Week of Feb 9
      '2026-02-17T10:00:00', // Week of Feb 16
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(4)
  })

  it('current week has session → includes current week in streak', () => {
    fakeNow('2026-02-26')
    const dates = [
      '2026-02-17T10:00:00', // Last week
      '2026-02-25T10:00:00', // This week
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(2)
  })

  it('year boundary: sessions in weeks 51, 52, 1, 2 → streak = 4', () => {
    fakeNow('2027-01-14') // Week 2 of 2027 (Thursday)
    const dates = [
      '2026-12-14T10:00:00', // Week of Dec 14 (Mon)
      '2026-12-21T10:00:00', // Week of Dec 21 (Mon)
      '2026-12-28T10:00:00', // Week of Dec 28 (Mon)
      '2027-01-04T10:00:00', // Week of Jan 4 (Mon)
      '2027-01-12T10:00:00', // Week of Jan 11 (Mon) — current
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(5)
    expect(result.longestStreak).toBe(5)
  })

  it('longest streak different from current streak', () => {
    fakeNow('2026-02-26')
    // Old long streak of 5, then gap, then current of 2
    const dates = [
      '2025-12-01T10:00:00', // 5 consecutive weeks
      '2025-12-08T10:00:00',
      '2025-12-15T10:00:00',
      '2025-12-22T10:00:00',
      '2025-12-29T10:00:00',
      // Gap
      '2026-02-17T10:00:00', // Current streak of 2
      '2026-02-23T10:00:00',
    ]
    const result = computeStreaks(dates)
    expect(result.currentStreak).toBe(2)
    expect(result.longestStreak).toBe(5)
  })
})

describe('getMilestoneKey', () => {
  it('returns null for streaks under 4', () => {
    expect(getMilestoneKey(3)).toBeNull()
    expect(getMilestoneKey(0)).toBeNull()
  })

  it('returns milestone4 for 4 weeks', () => {
    expect(getMilestoneKey(4)).toBe('home.milestone4')
  })

  it('returns milestone8 for 8 weeks', () => {
    expect(getMilestoneKey(8)).toBe('home.milestone8')
  })

  it('returns milestone52 for 52+ weeks', () => {
    expect(getMilestoneKey(60)).toBe('home.milestone52')
  })
})
