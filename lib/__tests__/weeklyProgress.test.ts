import { describe, it, expect } from 'vitest'
import { getMondayOfWeek, getNextMonday, computeWeeklyDays } from '../weeklyProgress'

describe('getMondayOfWeek', () => {
  it('returns Monday for a Monday input', () => {
    // 2026-02-23 is Monday
    const result = getMondayOfWeek(new Date(2026, 1, 23, 14, 30))
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(23)
    expect(result.getHours()).toBe(0)
  })

  it('returns previous Monday for a Wednesday', () => {
    // 2026-02-25 is Wednesday → Monday is Feb 23
    const result = getMondayOfWeek(new Date(2026, 1, 25))
    expect(result.getDate()).toBe(23)
  })

  it('returns previous Monday for a Sunday', () => {
    // 2026-03-01 is Sunday → Monday is Feb 23
    const result = getMondayOfWeek(new Date(2026, 2, 1))
    expect(result.getDate()).toBe(23)
    expect(result.getMonth()).toBe(1) // Feb
  })

  it('handles month boundary: Saturday March 7 → Monday March 2', () => {
    // 2026-03-07 is Saturday → Monday is March 2
    const result = getMondayOfWeek(new Date(2026, 2, 7))
    expect(result.getDate()).toBe(2)
    expect(result.getMonth()).toBe(2)
  })
})

describe('getNextMonday', () => {
  it('returns the following Monday', () => {
    const monday = new Date(2026, 1, 23)
    const next = getNextMonday(monday)
    expect(next.getDate()).toBe(2)
    expect(next.getMonth()).toBe(2) // March
  })
})

describe('computeWeeklyDays', () => {
  const monday = new Date(2026, 1, 23, 0, 0, 0)
  const nextMonday = new Date(2026, 2, 2, 0, 0, 0)

  it('counts distinct days with sessions', () => {
    const dates = [
      '2026-02-23T10:00:00.000Z', // Monday
      '2026-02-25T10:00:00.000Z', // Wednesday
      '2026-02-27T10:00:00.000Z', // Friday
    ]
    const result = computeWeeklyDays(dates, monday, nextMonday)
    expect(result.daysCompleted).toBe(3)
    expect(result.workoutDayNumbers.has(1)).toBe(true) // Monday
    expect(result.workoutDayNumbers.has(3)).toBe(true) // Wednesday
    expect(result.workoutDayNumbers.has(5)).toBe(true) // Friday
  })

  it('counts multiple sessions on same day as 1', () => {
    const dates = [
      '2026-02-23T08:00:00.000Z', // Monday AM
      '2026-02-23T18:00:00.000Z', // Monday PM
    ]
    const result = computeWeeklyDays(dates, monday, nextMonday)
    expect(result.daysCompleted).toBe(1)
  })

  it('excludes sessions outside the week range', () => {
    const dates = [
      '2026-02-22T10:00:00.000Z', // Sunday before
      '2026-02-23T10:00:00.000Z', // Monday (in range)
      '2026-03-02T10:00:00.000Z', // Monday next (out of range)
    ]
    const result = computeWeeklyDays(dates, monday, nextMonday)
    expect(result.daysCompleted).toBe(1)
  })

  it('returns 0 for empty dates', () => {
    const result = computeWeeklyDays([], monday, nextMonday)
    expect(result.daysCompleted).toBe(0)
    expect(result.workoutDayNumbers.size).toBe(0)
  })

  it('uses local calendar date for weekday mapping', () => {
    // A timestamp that is still "the same local day" but with midday UTC
    // new Date('2026-02-25T12:00:00.000Z') should map to Wednesday (3) in all timezones
    const dates = ['2026-02-25T12:00:00.000Z']
    const result = computeWeeklyDays(dates, monday, nextMonday)
    // Verify it maps to the local date's weekday (Wed = 3)
    const localDay = new Date(new Date(dates[0]).getFullYear(), new Date(dates[0]).getMonth(), new Date(dates[0]).getDate()).getDay()
    expect(result.workoutDayNumbers.has(localDay)).toBe(true)
    expect(result.daysCompleted).toBe(1)
  })
})
