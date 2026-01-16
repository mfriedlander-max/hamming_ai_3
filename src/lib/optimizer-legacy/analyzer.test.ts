import { describe, it, expect } from 'vitest'
import { aggregateOptimizerData } from './analyzer'
import type { CalendarResponse } from '../calendar/types'

describe('analyzer', () => {
  describe('aggregateOptimizerData', () => {
    const mockSubscriptions = [
      {
        id: 'sub1',
        service_id: 'svc1',
        monthly_cost: 15.99,
        status: 'active' as const,
        service: { id: 'svc1', name: 'Netflix', slug: 'netflix' },
      },
      {
        id: 'sub2',
        service_id: 'svc2',
        monthly_cost: 12.99,
        status: 'active' as const,
        service: { id: 'svc2', name: 'Hulu', slug: 'hulu' },
      },
    ]

    const mockTasteProfile = {
      genres: ['Action', 'Sci-Fi'],
      favorite_shows: ['Stranger Things', 'The Mandalorian'],
    }

    const mockCalendar: CalendarResponse = {
      months: [
        {
          month: '2026-01',
          services: [
            {
              service_id: 'svc1',
              service_name: 'Netflix',
              releases: [
                {
                  id: 'r1',
                  tmdb_id: 123,
                  title: 'Stranger Things S5',
                  type: 'tv',
                  release_date: '2026-01-15',
                  poster_url: null,
                  genres: ['Sci-Fi', 'Horror'],
                },
              ],
            },
          ],
        },
        {
          month: '2026-02',
          services: [
            {
              service_id: 'svc2',
              service_name: 'Hulu',
              releases: [
                {
                  id: 'r2',
                  tmdb_id: 456,
                  title: 'New Show',
                  type: 'tv',
                  release_date: '2026-02-10',
                  poster_url: null,
                  genres: ['Comedy'],
                },
              ],
            },
          ],
        },
      ],
    }

    it('transforms subscriptions to optimizer format', () => {
      const result = aggregateOptimizerData(
        mockSubscriptions,
        mockTasteProfile,
        mockCalendar,
        '2026-01'
      )

      expect(result.subscriptions).toHaveLength(2)
      expect(result.subscriptions[0]).toEqual({
        id: 'sub1',
        service_id: 'svc1',
        service_name: 'Netflix',
        monthly_cost: 15.99,
        status: 'active',
      })
    })

    it('includes taste profile', () => {
      const result = aggregateOptimizerData(
        mockSubscriptions,
        mockTasteProfile,
        mockCalendar,
        '2026-01'
      )

      expect(result.taste_profile).toEqual({
        genres: ['Action', 'Sci-Fi'],
        favorite_shows: ['Stranger Things', 'The Mandalorian'],
      })
    })

    it('transforms calendar data to content by month', () => {
      const result = aggregateOptimizerData(
        mockSubscriptions,
        mockTasteProfile,
        mockCalendar,
        '2026-01'
      )

      expect(result.content_by_month).toHaveLength(2)
      expect(result.content_by_month[0].month).toBe('2026-01')
      expect(result.content_by_month[0].services[0].releases[0].title).toBe(
        'Stranger Things S5'
      )
    })

    it('sets the start month correctly', () => {
      const result = aggregateOptimizerData(
        mockSubscriptions,
        mockTasteProfile,
        mockCalendar,
        '2026-01'
      )

      expect(result.start_month).toBe('2026-01')
    })

    it('handles empty subscriptions', () => {
      const result = aggregateOptimizerData(
        [],
        mockTasteProfile,
        mockCalendar,
        '2026-01'
      )

      expect(result.subscriptions).toHaveLength(0)
    })

    it('handles empty calendar', () => {
      const emptyCalendar: CalendarResponse = { months: [] }
      const result = aggregateOptimizerData(
        mockSubscriptions,
        mockTasteProfile,
        emptyCalendar,
        '2026-01'
      )

      expect(result.content_by_month).toHaveLength(0)
    })

    it('handles empty taste profile', () => {
      const emptyTaste = { genres: [], favorite_shows: [] }
      const result = aggregateOptimizerData(
        mockSubscriptions,
        emptyTaste,
        mockCalendar,
        '2026-01'
      )

      expect(result.taste_profile.genres).toHaveLength(0)
      expect(result.taste_profile.favorite_shows).toHaveLength(0)
    })
  })
})
