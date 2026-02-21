import { describe, it, expect } from 'vitest'
import { estimateMax1RM, formatVolume, groupByWeek, rangeToDays, needsWeeklyDownsample } from '../formulas'

describe('estimateMax1RM', () => {
  it('returns weight for 1 rep', () => {
    expect(estimateMax1RM(100, 1)).toBe(100)
  })

  it('applies Epley formula for multiple reps', () => {
    // 100 × (1 + 5/30) = 100 × 1.1667 ≈ 117
    expect(estimateMax1RM(100, 5)).toBe(117)
  })

  it('clamps reps at 15', () => {
    // 20 reps should be treated as 15: 60 × (1 + 15/30) = 60 × 1.5 = 90
    expect(estimateMax1RM(60, 20)).toBe(90)
    // Same as 15 reps
    expect(estimateMax1RM(60, 15)).toBe(90)
  })

  it('returns 0 for zero weight', () => {
    expect(estimateMax1RM(0, 10)).toBe(0)
  })

  it('returns 0 for zero reps', () => {
    expect(estimateMax1RM(100, 0)).toBe(0)
  })

  it('returns 0 for negative weight', () => {
    expect(estimateMax1RM(-50, 5)).toBe(0)
  })
})

describe('formatVolume', () => {
  it('formats small values with kg suffix', () => {
    expect(formatVolume(1400, 'en')).toBe('1,400 kg')
  })

  it('formats values >= 10000 as tonnes', () => {
    expect(formatVolume(12450, 'en')).toBe('12.5t')
  })

  it('formats French locale with space separator', () => {
    const result = formatVolume(1400, 'fr')
    // French locale uses narrow non-breaking space
    expect(result).toContain('1')
    expect(result).toContain('400')
    expect(result).toContain('kg')
  })

  it('formats zero', () => {
    expect(formatVolume(0, 'en')).toBe('0 kg')
  })

  it('formats tonnes in French', () => {
    const result = formatVolume(15000, 'fr')
    expect(result).toContain('t')
  })
})

describe('groupByWeek', () => {
  it('groups daily data into weekly buckets', () => {
    const data = [
      { date: '2026-02-16', value: 100 }, // Monday
      { date: '2026-02-17', value: 200 }, // Tuesday (same week)
      { date: '2026-02-23', value: 300 }, // Next Monday
    ]
    const result = groupByWeek(data)
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2026-02-16')
    expect(result[0].value).toBe(300) // 100 + 200
    expect(result[1].date).toBe('2026-02-23')
    expect(result[1].value).toBe(300)
  })

  it('returns empty array for empty input', () => {
    expect(groupByWeek([])).toEqual([])
  })

  it('handles Sunday correctly (belongs to previous week)', () => {
    const data = [
      { date: '2026-02-22', value: 100 }, // Sunday → week of Feb 16 (Mon)
    ]
    const result = groupByWeek(data)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-02-16')
  })

  it('sorts output by date', () => {
    const data = [
      { date: '2026-02-24', value: 50 },
      { date: '2026-02-10', value: 80 },
    ]
    const result = groupByWeek(data)
    expect(result[0].date < result[1].date).toBe(true)
  })
})

describe('rangeToDays', () => {
  it('maps known ranges', () => {
    expect(rangeToDays('1W')).toBe(7)
    expect(rangeToDays('1M')).toBe(30)
    expect(rangeToDays('3M')).toBe(90)
    expect(rangeToDays('6M')).toBe(180)
    expect(rangeToDays('1Y')).toBe(365)
  })

  it('defaults to 30 for unknown', () => {
    expect(rangeToDays('???')).toBe(30)
  })
})

describe('needsWeeklyDownsample', () => {
  it('returns true for 6M and 1Y', () => {
    expect(needsWeeklyDownsample('6M')).toBe(true)
    expect(needsWeeklyDownsample('1Y')).toBe(true)
  })

  it('returns false for shorter ranges', () => {
    expect(needsWeeklyDownsample('1W')).toBe(false)
    expect(needsWeeklyDownsample('1M')).toBe(false)
    expect(needsWeeklyDownsample('3M')).toBe(false)
  })
})
