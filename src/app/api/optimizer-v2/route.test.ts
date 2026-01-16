import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { POST } from './route'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

// Helper to create a comprehensive mock for a table
function createTableMock(data: unknown, error: unknown = null) {
  const chainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockResolvedValue({ data, error }),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  // Make select return the chain
  chainMock.select.mockReturnValue(chainMock)
  chainMock.eq.mockReturnValue(chainMock)
  chainMock.gte.mockReturnValue(chainMock)
  chainMock.lte.mockReturnValue(chainMock)
  return chainMock
}

describe('/api/optimizer-v2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const request = new Request('http://localhost/api/optimizer-v2', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns plan with empty schedule when no data', async () => {
      const mockFrom = vi.fn((table: string) => {
        if (table === 'subscriptions') {
          const mock = createTableMock([])
          mock.eq.mockResolvedValue({ data: [], error: null })
          return mock
        }
        if (table === 'taste_profiles') {
          return createTableMock(null, { code: 'PGRST116' })
        }
        if (table === 'watchlist_items' || table === 'friend_shares' || table === 'binge_plans') {
          const mock = createTableMock([])
          mock.eq.mockResolvedValue({ data: [], error: null })
          return mock
        }
        if (table === 'content') {
          return createTableMock([])
        }
        if (table === 'optimizer_plans') {
          return createTableMock(null, { code: 'PGRST116' })
        }
        return createTableMock(null)
      })

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: mockFrom,
      })

      const request = new Request('http://localhost/api/optimizer-v2', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.plan).toBeDefined()
      expect(data.plan.watch_intents).toBeDefined()
      expect(data.plan.savings).toBeDefined()
    })

    it('generates optimized plan from user data', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          service_id: 'netflix',
          monthly_cost: 15.99,
          status: 'active',
          service: { id: 'netflix', name: 'Netflix', slug: 'netflix' },
        },
      ]

      const mockTasteProfile = {
        genres: ['Action', 'Comedy'],
        favorite_shows: ['Breaking Bad'],
      }

      const mockWatchlistItems = [
        {
          tmdb_id: 123,
          content_type: 'movie',
          title: 'Test Movie',
          poster_path: null,
        },
      ]

      const mockFrom = vi.fn((table: string) => {
        if (table === 'subscriptions') {
          const mock = createTableMock(mockSubscriptions)
          mock.eq.mockResolvedValue({ data: mockSubscriptions, error: null })
          return mock
        }
        if (table === 'taste_profiles') {
          return createTableMock(mockTasteProfile)
        }
        if (table === 'watchlist_items') {
          const mock = createTableMock(mockWatchlistItems)
          mock.eq.mockResolvedValue({ data: mockWatchlistItems, error: null })
          return mock
        }
        if (table === 'friend_shares' || table === 'binge_plans') {
          const mock = createTableMock([])
          mock.eq.mockResolvedValue({ data: [], error: null })
          return mock
        }
        if (table === 'content') {
          return createTableMock([])
        }
        if (table === 'optimizer_plans') {
          return createTableMock(null, { code: 'PGRST116' })
        }
        return createTableMock(null)
      })

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: mockFrom,
      })

      const request = new Request('http://localhost/api/optimizer-v2', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.plan).toBeDefined()
      expect(data.plan.watch_intents.length).toBeGreaterThan(0)
    })

    it('returns from_cache when plan exists and is fresh', async () => {
      const cachedPlan = {
        generated_at: new Date().toISOString(),
        inputs_hash: '-54c4b91b',
        watch_intents: [],
        watch_schedule: [],
        subscription_windows: [],
        this_week_actions: [],
        savings: {
          current_yearly: 0,
          optimized_yearly: 0,
          savings_yearly: 0,
          savings_percent: 0,
        },
      }

      const mockFrom = vi.fn((table: string) => {
        if (table === 'optimizer_plans') {
          return createTableMock({
            plan: cachedPlan,
            inputs_hash: cachedPlan.inputs_hash,
          })
        }
        if (table === 'subscriptions') {
          const mock = createTableMock([])
          mock.eq.mockResolvedValue({ data: [], error: null })
          return mock
        }
        if (table === 'taste_profiles') {
          return createTableMock(null, { code: 'PGRST116' })
        }
        if (table === 'watchlist_items' || table === 'friend_shares' || table === 'binge_plans') {
          const mock = createTableMock([])
          mock.eq.mockResolvedValue({ data: [], error: null })
          return mock
        }
        if (table === 'content') {
          return createTableMock([])
        }
        return createTableMock(null)
      })

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-cached' } },
            error: null,
          }),
        },
        from: mockFrom,
      })

      const request = new Request('http://localhost/api/optimizer-v2', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.from_cache).toBeDefined()
    })
  })
})
