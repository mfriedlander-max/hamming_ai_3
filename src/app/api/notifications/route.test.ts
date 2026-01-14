import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH, POST } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
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

describe('/api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
    })
    mockOrder.mockReturnValue({
      limit: mockLimit,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return notifications with unread count', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'content_release',
          title: 'New show',
          body: 'Coming soon',
          data: {},
          read: false,
          created_at: '2026-01-13T10:00:00Z',
        },
        {
          id: 'notif-2',
          user_id: 'user-123',
          type: 'pause_suggestion',
          title: 'Consider pausing',
          body: 'No content',
          data: {},
          read: true,
          created_at: '2026-01-12T10:00:00Z',
        },
      ]

      mockLimit.mockResolvedValue({
        data: mockNotifications,
        error: null,
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.notifications).toHaveLength(2)
      expect(data.unread_count).toBe(1)
    })

    it('should return 500 on database error', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const response = await GET()
      expect(response.status).toBe(500)
    })
  })

  describe('PATCH', () => {
    it('should mark a single notification as read', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ notification_id: 'notif-1' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)
    })

    it('should mark all notifications as read', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const request = new Request('http://localhost/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ mark_all_read: true }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ notification_id: 'notif-1' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(401)
    })
  })

  describe('POST', () => {
    it('should create a new notification', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'notif-new',
              user_id: 'user-123',
              type: 'content_release',
              title: 'New content',
              body: 'Coming soon',
              data: {},
              read: false,
              created_at: '2026-01-13T10:00:00Z',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'content_release',
          title: 'New content',
          body: 'Coming soon',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.id).toBe('notif-new')
    })

    it('should return 400 for invalid notification type', async () => {
      const request = new Request('http://localhost/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'invalid_type',
          title: 'Test',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
