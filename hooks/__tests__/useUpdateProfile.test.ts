import { describe, it, expect } from 'vitest'
import { parseLimitations, formatLimitations } from '@/lib/profileHelpers'

describe('parseLimitations', () => {
  it('parses comma-separated items', () => {
    expect(parseLimitations('lower back pain, shoulder injury')).toEqual([
      'lower back pain',
      'shoulder injury',
    ])
  })

  it('handles single item without comma', () => {
    expect(parseLimitations('lower back pain')).toEqual(['lower back pain'])
  })

  it('returns empty array for empty string', () => {
    expect(parseLimitations('')).toEqual([])
  })

  it('returns empty array for only commas and spaces', () => {
    expect(parseLimitations(', , ,')).toEqual([])
  })

  it('trims whitespace from items', () => {
    expect(parseLimitations('  lower back pain ,  shoulder  ')).toEqual([
      'lower back pain',
      'shoulder',
    ])
  })
})

describe('formatLimitations', () => {
  it('joins array with comma and space', () => {
    expect(formatLimitations(['lower back pain', 'shoulder injury'])).toBe(
      'lower back pain, shoulder injury',
    )
  })

  it('returns empty string for empty array', () => {
    expect(formatLimitations([])).toBe('')
  })
})
