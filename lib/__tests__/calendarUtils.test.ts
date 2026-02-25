import { describe, it, expect } from 'vitest'
import {
  getDaysInMonth,
  buildCalendarGrid,
  formatMonthYear,
  getWeekdayHeaders,
  isCurrentMonth,
  prevMonth,
  nextMonth,
} from '@/lib/calendarUtils'

describe('getDaysInMonth', () => {
  it('returns 28 for non-leap February', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28)
  })

  it('returns 29 for leap year February', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29)
  })

  it('returns 31 for January', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31)
  })

  it('returns 30 for April', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30)
  })
})

describe('buildCalendarGrid', () => {
  it('builds correct grid for Feb 2026 (starts on Sunday)', () => {
    const grid = buildCalendarGrid(2026, 2)
    // Feb 1 2026 is a Sunday → offset 6 (Mon-based)
    expect(grid[0]).toEqual([null, null, null, null, null, null, 1])
    expect(grid[1]).toEqual([2, 3, 4, 5, 6, 7, 8])
    // 28 days in Feb 2026
    const lastWeek = grid[grid.length - 1]
    expect(lastWeek).toContain(28)
  })

  it('builds correct grid for March 2026 (starts on Sunday)', () => {
    const grid = buildCalendarGrid(2026, 3)
    // March 1 2026 is Sunday → offset 6
    expect(grid[0]).toEqual([null, null, null, null, null, null, 1])
    expect(grid.length).toBeGreaterThanOrEqual(5)
  })

  it('pads last week with nulls', () => {
    const grid = buildCalendarGrid(2026, 2)
    const lastWeek = grid[grid.length - 1]
    expect(lastWeek.length).toBe(7)
  })

  it('handles month starting on Monday (no offset)', () => {
    // Sep 2025 starts on Monday
    const grid = buildCalendarGrid(2025, 9)
    expect(grid[0][0]).toBe(1)
  })

  it('all weeks have exactly 7 cells', () => {
    const grid = buildCalendarGrid(2026, 1)
    for (const week of grid) {
      expect(week.length).toBe(7)
    }
  })

  it('contains all days of the month', () => {
    const grid = buildCalendarGrid(2024, 2) // 29 days (leap)
    const allDays = grid.flat().filter((d): d is number => d !== null)
    expect(allDays.length).toBe(29)
    expect(Math.min(...allDays)).toBe(1)
    expect(Math.max(...allDays)).toBe(29)
  })
})

describe('formatMonthYear', () => {
  it('formats in English', () => {
    const result = formatMonthYear(2026, 2, 'en')
    expect(result).toContain('February')
    expect(result).toContain('2026')
  })

  it('formats in French', () => {
    const result = formatMonthYear(2026, 2, 'fr')
    expect(result.toLowerCase()).toContain('f\u00e9vrier')
    expect(result).toContain('2026')
  })
})

describe('getWeekdayHeaders', () => {
  it('returns 7 headers starting from Monday', () => {
    const headers = getWeekdayHeaders('en')
    expect(headers.length).toBe(7)
    expect(headers[0]).toBe('M')
    expect(headers[6]).toBe('S')
  })
})

describe('isCurrentMonth', () => {
  it('returns true for current month', () => {
    const now = new Date()
    expect(isCurrentMonth(now.getFullYear(), now.getMonth() + 1)).toBe(true)
  })

  it('returns false for different month', () => {
    expect(isCurrentMonth(2020, 1)).toBe(false)
  })
})

describe('prevMonth / nextMonth', () => {
  it('wraps December to previous year January', () => {
    expect(prevMonth(2026, 1)).toEqual({ year: 2025, month: 12 })
  })

  it('wraps January to next year December', () => {
    expect(nextMonth(2025, 12)).toEqual({ year: 2026, month: 1 })
  })

  it('normal prev month', () => {
    expect(prevMonth(2026, 6)).toEqual({ year: 2026, month: 5 })
  })

  it('normal next month', () => {
    expect(nextMonth(2026, 6)).toEqual({ year: 2026, month: 7 })
  })
})
