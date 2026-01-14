import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()
const mockFrom = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

describe('/api/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    })
    mockEq.mockReturnValue({
      order: mockOrder,
    })
    mockOrder.mockReturnValue({
      range: mockRange,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/activity')
      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should return activity feed with default pagination', async () => {
      const mockActivities = [
        {
          id: 'a1',
          user_id: 'user-456',
          action: 'subscribed',
          service_id: 'service-1',
          created_at: '2026-01-10T10:00:00Z',
          profile: { id: 'user-456', name: 'John' },
          service: { id: 'service-1', name: 'Netflix', logo_path: '/netflix.svg' },
        },
        {
          id: 'a2',
          user_id: 'user-123',
          action: 'paused',
          service_id: 'service-2',
          created_at: '2026-01-09T10:00:00Z',
          profile: { id: 'user-123', name: 'Me' },
          service: { id: 'service-2', name: 'Hulu', logo_path: '/hulu.svg' },
        },
      ]

      mockRange.mockResolvedValue({
        data: mockActivities,
        error: null,
      })

      const request = new Request('http://localhost/api/activity')
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.activities).toBeDefined()
      expect(data.activities.length).toBe(2)
      expect(data.has_more).toBe(false)
    })

    it('should handle pagination parameters', async () => {
      const mockActivities = Array.from({ length: 21 }, (_, i) => ({
        id: `a${i}`,
        user_id: 'user-456',
        action: 'subscribed',
        service_id: 'service-1',
        created_at: '2026-01-10T10:00:00Z',
        profile: { id: 'user-456', name: 'John' },
        service: { id: 'service-1', name: 'Netflix', logo_path: null },
      }))

      mockRange.mockResolvedValue({
        data: mockActivities,
        error: null,
      })

      const request = new Request('http://localhost/api/activity?limit=20&offset=0')
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.activities.length).toBe(20)
      expect(data.has_more).toBe(true)
    })

    it('should return 500 on database error', async () => {
      mockRange.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const request = new Request('http://localhost/api/activity')
      const response = await GET(request)
      expect(response.status).toBe(500)
    })

    it('should handle empty activity feed', async () => {
      mockRange.mockResolvedValue({
        data: [],
        error: null,
      })

      const request = new Request('http://localhost/api/activity')
      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.activities).toEqual([])
      expect(data.has_more).toBe(false)
    })
  })
})
