import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock the Claude client
vi.mock('@/lib/claude/client', () => ({
  ClaudeClient: vi.fn().mockImplementation(() => ({
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
  })),
}))

// Mock fetch for Claude API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

import { createClient } from '@/lib/supabase/server'
import { POST } from './route'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

describe('/api/optimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-api-key'
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

      const request = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 503 when API key is not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('AI service not configured')
    })

    it('returns empty schedule when no subscriptions', async () => {
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
                  data: [],
                  error: null,
                }),
              }),
            }
          }
          return {}
        }),
      })

      const request = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schedule).toBeDefined()
      expect(data.schedule.savings).toBe(0)
    })

    it('generates optimized schedule with Claude', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          service_id: 'svc-1',
          monthly_cost: 15.99,
          status: 'active',
          service: { id: 'svc-1', name: 'Netflix', slug: 'netflix' },
        },
      ]

      const mockTasteProfile = {
        genres: ['Action', 'Sci-Fi'],
        favorite_shows: ['Stranger Things'],
      }

      const mockContent = [
        {
          id: 'content-1',
          tmdb_id: 1001,
          title: 'New Movie',
          type: 'movie',
          release_date: '2026-02-15',
          genres: ['Action'],
          service_ids: ['svc-1'],
        },
      ]

      const mockClaudeResponse = {
        current_annual_cost: 191.88,
        optimized_annual_cost: 95.94,
        savings: 95.94,
        months: [
          {
            month: '2026-01',
            actions: [
              {
                service_id: 'svc-1',
                service_name: 'Netflix',
                action: 'cancel',
                date: '2026-01-15',
                reason: 'No matching content this month',
              },
            ],
            active_services: [],
            monthly_cost: 0,
          },
          {
            month: '2026-02',
            actions: [
              {
                service_id: 'svc-1',
                service_name: 'Netflix',
                action: 'subscribe',
                date: '2026-02-01',
                reason: 'New action movie releasing',
              },
            ],
            active_services: ['svc-1'],
            monthly_cost: 15.99,
          },
        ],
      }

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
          if (table === 'taste_profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockTasteProfile,
                    error: null,
                  }),
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              {
                type: 'text',
                text: JSON.stringify(mockClaudeResponse),
              },
            ],
          }),
      })

      const request = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schedule).toBeDefined()
      expect(data.schedule.savings).toBe(95.94)
      expect(data.schedule.months).toHaveLength(2)
    })

    it('returns cached schedule on subsequent calls', async () => {
      // First call setup
      const mockSubscriptions = [
        {
          id: 'sub-1',
          service_id: 'svc-1',
          monthly_cost: 15.99,
          status: 'active',
          service: { id: 'svc-1', name: 'Netflix', slug: 'netflix' },
        },
      ]

      const mockTasteProfile = {
        genres: ['Action'],
        favorite_shows: [],
      }

      const mockClaudeResponse = {
        current_annual_cost: 191.88,
        optimized_annual_cost: 150,
        savings: 41.88,
        months: [
          {
            month: '2026-01',
            actions: [],
            active_services: ['svc-1'],
            monthly_cost: 15.99,
          },
        ],
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-cache-test' } },
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
          if (table === 'taste_profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockTasteProfile,
                    error: null,
                  }),
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: JSON.stringify(mockClaudeResponse) }],
          }),
      })

      // First request
      const request1 = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })
      const response1 = await POST(request1)
      const data1 = await response1.json()

      expect(data1.cached).toBe(false)

      // Second request (should be cached)
      const request2 = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })
      const response2 = await POST(request2)
      const data2 = await response2.json()

      expect(data2.cached).toBe(true)
      expect(data2.schedule.savings).toBe(data1.schedule.savings)
    })

    it('bypasses cache when forceRefresh is true', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          service_id: 'svc-1',
          monthly_cost: 15.99,
          status: 'active',
          service: { id: 'svc-1', name: 'Netflix', slug: 'netflix' },
        },
      ]

      const mockTasteProfile = {
        genres: ['Action'],
        favorite_shows: [],
      }

      let callCount = 0
      const mockClaudeResponse1 = {
        current_annual_cost: 191.88,
        optimized_annual_cost: 150,
        savings: 41.88,
        months: [
          { month: '2026-01', actions: [], active_services: ['svc-1'], monthly_cost: 15.99 },
        ],
      }
      const mockClaudeResponse2 = {
        current_annual_cost: 191.88,
        optimized_annual_cost: 100,
        savings: 91.88,
        months: [
          { month: '2026-01', actions: [], active_services: ['svc-1'], monthly_cost: 15.99 },
        ],
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-force-refresh' } },
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
          if (table === 'taste_profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockTasteProfile,
                    error: null,
                  }),
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

      mockFetch.mockImplementation(() => {
        callCount++
        const response = callCount === 1 ? mockClaudeResponse1 : mockClaudeResponse2
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ type: 'text', text: JSON.stringify(response) }],
          }),
        })
      })

      // First request
      const request1 = new Request('http://localhost/api/optimizer', {
        method: 'POST',
      })
      await POST(request1)

      // Force refresh request
      const request2 = new Request('http://localhost/api/optimizer', {
        method: 'POST',
        body: JSON.stringify({ forceRefresh: true }),
      })
      const response2 = await POST(request2)
      const data2 = await response2.json()

      expect(data2.cached).toBe(false)
      expect(data2.schedule.savings).toBe(91.88) // Should have new value
    })
  })
})
