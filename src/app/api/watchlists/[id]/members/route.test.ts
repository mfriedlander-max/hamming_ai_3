import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'

// Mock Supabase client
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
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

const mockParams = { id: 'wl-123' }

describe('/api/watchlists/[id]/members', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      insert: mockInsert,
      delete: mockDelete,
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ friend_id: 'user-456', role: 'viewer' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return 400 if friend_id is missing', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ role: 'viewer' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid role', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ friend_id: 'user-456', role: 'invalid' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should add member to watchlist with default role', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              watchlist_id: 'wl-123',
              user_id: 'user-456',
              role: 'viewer',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ friend_id: 'user-456' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.user_id).toBe('user-456')
      expect(data.role).toBe('viewer')
    })

    it('should add member with specified role', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              watchlist_id: 'wl-123',
              user_id: 'user-456',
              role: 'editor',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ friend_id: 'user-456', role: 'editor' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.role).toBe('editor')
    })

    it('should return 500 on database error', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'POST',
        body: JSON.stringify({ friend_id: 'user-456' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123/members?user_id=user-456', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return 400 if user_id is missing', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/members', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should remove member from watchlist', async () => {
      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/members?user_id=user-456', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(200)
    })
  })
})
