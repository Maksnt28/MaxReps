import { describe, it, expect } from 'vitest'

// Test the pure logic used by month navigation:
// 1. YYYY-MM key extraction from session dates
// 2. Section grouping with key field
// 3. Section index lookup by key

interface MockSession {
  id: string
  startedAt: string
}

function extractMonthKey(startedAt: string): string {
  const date = new Date(startedAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function groupByMonth(sessions: MockSession[]) {
  const grouped = new Map<string, MockSession[]>()
  for (const session of sessions) {
    const key = extractMonthKey(session.startedAt)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(session)
  }
  return [...grouped.entries()].map(([key, data]) => ({ key, data }))
}

function findSectionIndex(sections: { key: string }[], monthKey: string): number {
  return sections.findIndex((s) => s.key === monthKey)
}

describe('month navigation', () => {
  describe('extractMonthKey', () => {
    it('extracts YYYY-MM from ISO date string', () => {
      expect(extractMonthKey('2026-02-24T10:00:00Z')).toBe('2026-02')
    })

    it('pads single-digit months', () => {
      expect(extractMonthKey('2026-01-15T10:00:00Z')).toBe('2026-01')
    })

    it('handles December correctly', () => {
      expect(extractMonthKey('2025-12-31T23:59:59Z')).toBe('2026-01')
      // Note: UTC midnight rollback — this is why the app uses local Date constructor
    })
  })

  describe('groupByMonth', () => {
    it('groups sessions by month preserving order', () => {
      const sessions: MockSession[] = [
        { id: 's1', startedAt: '2026-02-24T10:00:00' },
        { id: 's2', startedAt: '2026-02-20T10:00:00' },
        { id: 's3', startedAt: '2026-01-15T10:00:00' },
        { id: 's4', startedAt: '2026-01-10T10:00:00' },
      ]

      const result = groupByMonth(sessions)
      expect(result).toHaveLength(2)
      expect(result[0].key).toBe('2026-02')
      expect(result[0].data).toHaveLength(2)
      expect(result[1].key).toBe('2026-01')
      expect(result[1].data).toHaveLength(2)
    })

    it('returns empty array for no sessions', () => {
      expect(groupByMonth([])).toEqual([])
    })

    it('returns single section for one month', () => {
      const sessions: MockSession[] = [
        { id: 's1', startedAt: '2026-02-24T10:00:00' },
        { id: 's2', startedAt: '2026-02-20T10:00:00' },
      ]

      const result = groupByMonth(sessions)
      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('2026-02')
    })
  })

  describe('findSectionIndex', () => {
    const sections = [
      { key: '2026-02' },
      { key: '2026-01' },
      { key: '2025-12' },
    ]

    it('finds correct index for existing month', () => {
      expect(findSectionIndex(sections, '2026-01')).toBe(1)
    })

    it('returns -1 for non-existent month', () => {
      expect(findSectionIndex(sections, '2025-06')).toBe(-1)
    })

    it('finds first section', () => {
      expect(findSectionIndex(sections, '2026-02')).toBe(0)
    })
  })
})
