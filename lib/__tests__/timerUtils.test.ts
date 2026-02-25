import { describe, it, expect, vi } from 'vitest'
import { formatTime, computeRemaining } from '../timerUtils'

describe('timerUtils', () => {
  describe('formatTime', () => {
    it('formats 90 seconds as 1:30', () => {
      expect(formatTime(90)).toBe('1:30')
    })

    it('formats 0 seconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    it('formats 65 seconds as 1:05', () => {
      expect(formatTime(65)).toBe('1:05')
    })

    it('formats 300 seconds as 5:00', () => {
      expect(formatTime(300)).toBe('5:00')
    })

    it('formats 5 seconds as 0:05', () => {
      expect(formatTime(5)).toBe('0:05')
    })
  })

  describe('computeRemaining', () => {
    it('returns 0 for null expiresAt', () => {
      expect(computeRemaining(null)).toBe(0)
    })

    it('returns correct seconds for future expiresAt', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)
      // 60s in the future
      expect(computeRemaining(now + 60000)).toBe(60)
    })

    it('returns 0 for past expiresAt', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)
      expect(computeRemaining(now - 5000)).toBe(0)
    })

    it('rounds up partial seconds', () => {
      const now = 1000000
      vi.spyOn(Date, 'now').mockReturnValue(now)
      // 500ms remaining → rounds up to 1
      expect(computeRemaining(now + 500)).toBe(1)
    })
  })
})
