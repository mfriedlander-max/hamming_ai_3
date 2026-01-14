import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from './route'

// Mock Supabase client
const mockDelete = vi.fn()
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

describe('/api/notifications/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      delete: mockDelete,
    })
    mockDelete.mockReturnValue({
      eq: mockEq,
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await DELETE(
        new Request('http://localhost/api/notifications/notif-1'),
        { params: Promise.resolve({ id: 'notif-1' }) }
      )
      expect(response.status).toBe(401)
    })

    it('should delete the notification successfully', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const response = await DELETE(
        new Request('http://localhost/api/notifications/notif-1'),
        { params: Promise.resolve({ id: 'notif-1' }) }
      )
      expect(response.status).toBe(200)
    })

    it('should return 500 on database error', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      })

      const response = await DELETE(
        new Request('http://localhost/api/notifications/notif-1'),
        { params: Promise.resolve({ id: 'notif-1' }) }
      )
      expect(response.status).toBe(500)
    })
  })
})
