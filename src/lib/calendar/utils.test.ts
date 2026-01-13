import { describe, it, expect } from 'vitest'
import {
  getMonthRange,
  groupReleasesByService,
  getPositionInMonth,
  formatMonthDisplay,
  parseMonthString,
} from './utils'
import type { ContentRelease } from './types'

describe('calendar utils', () => {
  describe('getMonthRange', () => {
    it('returns array of month strings starting from given date', () => {
      // Use constructor with explicit year, month, day to avoid timezone issues
      const result = getMonthRange(new Date(2026, 0, 15), 3)

      expect(result).toEqual(['2026-01', '2026-02', '2026-03'])
    })

    it('handles year boundary correctly', () => {
      const result = getMonthRange(new Date(2025, 10, 1), 4) // November is 10

      expect(result).toEqual(['2025-11', '2025-12', '2026-01', '2026-02'])
    })

    it('returns 6 months by default', () => {
      const result = getMonthRange(new Date(2026, 5, 1)) // June is 5

      expect(result).toHaveLength(6)
      expect(result[0]).toBe('2026-06')
      expect(result[5]).toBe('2026-11')
    })

    it('handles single month', () => {
      const result = getMonthRange(new Date(2026, 2, 15), 1) // March is 2

      expect(result).toEqual(['2026-03'])
    })
  })

  describe('groupReleasesByService', () => {
    const mockReleases: ContentRelease[] = [
      {
        id: 'content-1',
        tmdb_id: 1001,
        title: 'Movie A',
        type: 'movie',
        release_date: '2026-01-15',
        poster_url: '/poster1.jpg',
        genres: ['Action'],
      },
      {
        id: 'content-2',
        tmdb_id: 1002,
        title: 'Show B',
        type: 'tv',
        release_date: '2026-01-20',
        poster_url: '/poster2.jpg',
        genres: ['Drama'],
      },
    ]

    const mockServices = [
      { service_id: 'service-1', service_name: 'Netflix' },
      { service_id: 'service-2', service_name: 'Disney+' },
    ]

    it('groups releases by service with content', () => {
      const contentServiceMap = new Map<string, string[]>([
        ['content-1', ['service-1']],
        ['content-2', ['service-1', 'service-2']],
      ])

      const result = groupReleasesByService(
        mockReleases,
        mockServices,
        contentServiceMap
      )

      expect(result).toHaveLength(2)

      const netflix = result.find((s) => s.service_name === 'Netflix')
      expect(netflix?.releases).toHaveLength(2)

      const disney = result.find((s) => s.service_name === 'Disney+')
      expect(disney?.releases).toHaveLength(1)
      expect(disney?.releases[0].title).toBe('Show B')
    })

    it('returns empty releases for services with no content', () => {
      const contentServiceMap = new Map<string, string[]>([
        ['content-1', ['service-1']],
      ])

      const result = groupReleasesByService(
        mockReleases,
        mockServices,
        contentServiceMap
      )

      const disney = result.find((s) => s.service_name === 'Disney+')
      expect(disney?.releases).toHaveLength(0)
    })

    it('handles empty releases array', () => {
      const result = groupReleasesByService([], mockServices, new Map())

      expect(result).toHaveLength(2)
      result.forEach((service) => {
        expect(service.releases).toHaveLength(0)
      })
    })
  })

  describe('getPositionInMonth', () => {
    it('returns 0 for first day of month', () => {
      const position = getPositionInMonth('2026-01-01', '2026-01')

      expect(position).toBe(0)
    })

    it('returns ~1 for last day of month', () => {
      // January has 31 days
      const position = getPositionInMonth('2026-01-31', '2026-01')

      // Day 31 out of 31, so (30/30) = 1
      expect(position).toBeCloseTo(1, 1)
    })

    it('returns middle position for mid-month date', () => {
      const position = getPositionInMonth('2026-01-16', '2026-01')

      // Day 16 of 31: (15/30) ~ 0.5
      expect(position).toBeGreaterThan(0.4)
      expect(position).toBeLessThan(0.6)
    })

    it('handles February in leap year', () => {
      // 2028 is a leap year with 29 days
      const position = getPositionInMonth('2028-02-29', '2028-02')

      expect(position).toBeCloseTo(1, 1)
    })

    it('handles February in non-leap year', () => {
      // 2026 is not a leap year, February has 28 days
      const position = getPositionInMonth('2026-02-28', '2026-02')

      expect(position).toBeCloseTo(1, 1)
    })
  })

  describe('formatMonthDisplay', () => {
    it('formats month string for display', () => {
      expect(formatMonthDisplay('2026-01')).toBe('January 2026')
    })

    it('handles different months', () => {
      expect(formatMonthDisplay('2026-06')).toBe('June 2026')
      expect(formatMonthDisplay('2026-12')).toBe('December 2026')
    })
  })

  describe('parseMonthString', () => {
    it('parses month string to Date object', () => {
      const result = parseMonthString('2026-01')

      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(0) // January is 0
      expect(result.getDate()).toBe(1)
    })

    it('parses different months', () => {
      const result = parseMonthString('2026-12')

      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(11) // December is 11
    })
  })
})
