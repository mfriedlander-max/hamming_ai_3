import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockUpsert = vi.fn()
const mockEq = vi.fn()
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

describe('/api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      upsert: mockUpsert,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return existing preferences', async () => {
      const mockPreferences = {
        user_id: 'user-123',
        content_release: true,
        pause_suggestion: false,
        resubscribe_reminder: true,
        price_change: true,
      }

      mockEq.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.pause_suggestion).toBe(false)
    })

    it('should create default preferences if none exist', async () => {
      mockEq.mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No rows returned
        }),
      })

      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              user_id: 'user-123',
              content_release: true,
              pause_suggestion: true,
              resubscribe_reminder: true,
              price_change: true,
            },
            error: null,
          }),
        }),
      })

      const response = await GET()
      expect(response.status).toBe(200)
    })
  })

  describe('PATCH', () => {
    it('should update preferences', async () => {
      mockUpsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              user_id: 'user-123',
              content_release: false,
              pause_suggestion: true,
              resubscribe_reminder: true,
              price_change: true,
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ content_release: false }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.content_release).toBe(false)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ content_release: false }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(401)
    })
  })
})
