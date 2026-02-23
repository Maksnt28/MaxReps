import { describe, it, expect } from 'vitest'
import {
  TICK_SPACING,
  valueToOffset,
  offsetToValue,
  clampToStep,
  formatValue,
  generateTicks,
} from '../rulerPickerUtils'

describe('valueToOffset', () => {
  it('converts integer step values', () => {
    // Age: value 25, min 14, step 1 → (25-14) * 8 = 88
    expect(valueToOffset(25, 14, 1)).toBe(88)
  })

  it('converts min value to offset 0', () => {
    expect(valueToOffset(14, 14, 1)).toBe(0)
  })

  it('converts decimal step values (weight)', () => {
    // Weight: value 75.5, min 30, step 0.5 → (75.5-30)/0.5 * 8 = 728
    expect(valueToOffset(75.5, 30, 0.5)).toBe(728)
  })
})

describe('offsetToValue', () => {
  it('converts offset back to integer value', () => {
    expect(offsetToValue(88, 14, 80, 1)).toBe(25)
  })

  it('converts offset back to decimal value', () => {
    expect(offsetToValue(728, 30, 200, 0.5)).toBe(75.5)
  })

  it('snaps to nearest step for non-aligned offset', () => {
    // Offset 90 with step 1: raw = 14 + (90/8)*1 = 25.25 → snaps to 25
    expect(offsetToValue(90, 14, 80, 1)).toBe(25)
  })

  it('clamps below min', () => {
    expect(offsetToValue(-100, 14, 80, 1)).toBe(14)
  })

  it('clamps above max', () => {
    expect(offsetToValue(99999, 14, 80, 1)).toBe(80)
  })
})

describe('round-trip consistency', () => {
  it('valueToOffset → offsetToValue returns original (integer)', () => {
    const original = 42
    const offset = valueToOffset(original, 14, 1)
    expect(offsetToValue(offset, 14, 80, 1)).toBe(original)
  })

  it('valueToOffset → offsetToValue returns original (decimal)', () => {
    const original = 82.5
    const offset = valueToOffset(original, 30, 0.5)
    expect(offsetToValue(offset, 30, 200, 0.5)).toBe(original)
  })
})

describe('clampToStep', () => {
  it('snaps 75.7 to 75.5 for step=0.5', () => {
    expect(clampToStep(75.7, 30, 200, 0.5)).toBe(75.5)
  })

  it('snaps 75.3 to 75.5 for step=0.5', () => {
    expect(clampToStep(75.3, 30, 200, 0.5)).toBe(75.5)
  })

  it('clamps below min', () => {
    expect(clampToStep(5, 14, 80, 1)).toBe(14)
  })

  it('clamps above max', () => {
    expect(clampToStep(300, 30, 200, 0.5)).toBe(200)
  })
})

describe('formatValue', () => {
  it('formats integer step as whole number', () => {
    expect(formatValue(25, 1)).toBe('25')
  })

  it('formats decimal step with 1 decimal place', () => {
    expect(formatValue(75, 0.5)).toBe('75.0')
  })
})

describe('generateTicks', () => {
  it('generates correct count for age range', () => {
    const ticks = generateTicks(14, 80, 1, 10, 5)
    expect(ticks).toHaveLength(67) // (80-14)/1 + 1
  })

  it('generates correct count for weight range', () => {
    const ticks = generateTicks(30, 200, 0.5, 10, 5)
    expect(ticks).toHaveLength(341) // (200-30)/0.5 + 1
  })

  it('classifies major ticks correctly', () => {
    const ticks = generateTicks(14, 80, 1, 10, 5)
    const majors = ticks.filter((t) => t.type === 'major')
    // Major at 20, 30, 40, 50, 60, 70, 80 = 7
    expect(majors).toHaveLength(7)
    expect(majors.every((t) => t.label !== null)).toBe(true)
  })

  it('classifies mid ticks correctly', () => {
    const ticks = generateTicks(14, 80, 1, 10, 5)
    const mids = ticks.filter((t) => t.type === 'mid')
    // Mid at 15, 25, 35, 45, 55, 65, 75 = 7
    expect(mids).toHaveLength(7)
  })

  it('classifies weight major ticks correctly (step=0.5)', () => {
    const ticks = generateTicks(30, 200, 0.5, 10, 5)
    const majors = ticks.filter((t) => t.type === 'major')
    // Major at 30, 40, 50, ..., 200 = 18
    expect(majors).toHaveLength(18)
  })

  it('first tick is the min value', () => {
    const ticks = generateTicks(14, 80, 1, 10, 5)
    expect(ticks[0].value).toBe(14)
  })

  it('last tick is the max value', () => {
    const ticks = generateTicks(14, 80, 1, 10, 5)
    expect(ticks[ticks.length - 1].value).toBe(80)
  })
})
