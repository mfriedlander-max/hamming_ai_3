import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { GET } from './route'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

describe('/api/calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?start=2026-01-01&end=2026-06-30'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when start date is missing', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?end=2026-06-30'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('start')
    })

    it('returns 400 when end date is missing', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?start=2026-01-01'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('end')
    })

    it('returns calendar data grouped by month and service', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', service_id: 'service-1', service: { name: 'Netflix' } },
        { id: 'sub-2', service_id: 'service-2', service: { name: 'Disney+' } },
      ]

      const mockContent = [
        {
          id: 'content-1',
          tmdb_id: 1001,
          title: 'Movie A',
          type: 'movie',
          release_date: '2026-01-15',
          genres: ['Action'],
          service_ids: ['service-1'],
        },
        {
          id: 'content-2',
          tmdb_id: 1002,
          title: 'Show B',
          type: 'tv',
          release_date: '2026-02-20',
          genres: ['Drama'],
          service_ids: ['service-1', 'service-2'],
        },
      ]

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              }),
            }
          }
          if (table === 'content') {
            return {
              select: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    overlaps: vi.fn().mockResolvedValue({
                      data: mockContent,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?start=2026-01-01&end=2026-02-28'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.months).toHaveLength(2) // January and February

      // Check January
      const january = data.months.find(
        (m: { month: string }) => m.month === '2026-01'
      )
      expect(january).toBeDefined()
      expect(january.services).toHaveLength(2)

      // Netflix in January should have Movie A
      const netflixJan = january.services.find(
        (s: { service_name: string }) => s.service_name === 'Netflix'
      )
      expect(netflixJan.releases).toHaveLength(1)
      expect(netflixJan.releases[0].title).toBe('Movie A')

      // Check February
      const february = data.months.find(
        (m: { month: string }) => m.month === '2026-02'
      )
      expect(february).toBeDefined()

      // Both services in February should have Show B
      const netflixFeb = february.services.find(
        (s: { service_name: string }) => s.service_name === 'Netflix'
      )
      expect(netflixFeb.releases).toHaveLength(1)
      expect(netflixFeb.releases[0].title).toBe('Show B')

      const disneyFeb = february.services.find(
        (s: { service_name: string }) => s.service_name === 'Disney+'
      )
      expect(disneyFeb.releases).toHaveLength(1)
      expect(disneyFeb.releases[0].title).toBe('Show B')
    })

    it('returns empty months when no content available', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', service_id: 'service-1', service: { name: 'Netflix' } },
      ]

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              }),
            }
          }
          if (table === 'content') {
            return {
              select: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    overlaps: vi.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?start=2026-01-01&end=2026-01-31'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.months).toHaveLength(1)
      expect(data.months[0].services[0].releases).toHaveLength(0)
    })

    it('filters content by user subscribed services', async () => {
      // User only subscribed to Netflix
      const mockSubscriptions = [
        { id: 'sub-1', service_id: 'service-1', service: { name: 'Netflix' } },
      ]

      // Content exists on both Netflix and Disney+
      const mockContent = [
        {
          id: 'content-1',
          tmdb_id: 1001,
          title: 'Netflix Movie',
          type: 'movie',
          release_date: '2026-01-15',
          genres: ['Action'],
          service_ids: ['service-1'],
        },
        {
          id: 'content-2',
          tmdb_id: 1002,
          title: 'Disney Movie',
          type: 'movie',
          release_date: '2026-01-20',
          genres: ['Family'],
          service_ids: ['service-2'], // User not subscribed
        },
      ]

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              }),
            }
          }
          if (table === 'content') {
            return {
              select: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockReturnValue({
                    overlaps: vi.fn().mockResolvedValue({
                      data: mockContent,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      })

      const request = new NextRequest(
        'http://localhost/api/calendar?start=2026-01-01&end=2026-01-31'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should only have Netflix as a service
      expect(data.months[0].services).toHaveLength(1)
      expect(data.months[0].services[0].service_name).toBe('Netflix')
      // Should only have the Netflix movie
      expect(data.months[0].services[0].releases).toHaveLength(1)
      expect(data.months[0].services[0].releases[0].title).toBe('Netflix Movie')
    })
  })
})
