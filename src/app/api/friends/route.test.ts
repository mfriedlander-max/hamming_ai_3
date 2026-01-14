import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH, DELETE } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOr = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()
const mockGetUser = vi.fn()
const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

describe('/api/friends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
      or: mockOr,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      or: mockOr,
    })
    mockOr.mockReturnValue({
      eq: mockEq,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return friends and pending requests', async () => {
      const mockFriendships = [
        {
          id: 'f1',
          requester_id: 'user-123',
          addressee_id: 'user-456',
          status: 'accepted',
          created_at: '2026-01-01T00:00:00Z',
          addressee: { id: 'user-456', name: 'John', email: 'john@example.com' },
        },
        {
          id: 'f2',
          requester_id: 'user-789',
          addressee_id: 'user-123',
          status: 'pending',
          created_at: '2026-01-02T00:00:00Z',
          requester: { id: 'user-789', name: 'Jane', email: 'jane@example.com' },
        },
      ]

      mockOr.mockResolvedValue({
        data: mockFriendships,
        error: null,
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.friends).toBeDefined()
      expect(data.pending_requests).toBeDefined()
    })

    it('should return 500 on database error', async () => {
      mockOr.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const response = await GET()
      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: 'friend@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if email is missing', async () => {
      const request = new Request('http://localhost/api/friends', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 if trying to add self', async () => {
      // Mock the profile lookup to return the same user
      mockSingle.mockResolvedValue({
        data: { id: 'user-123', email: 'self@example.com' },
        error: null,
      })

      const request = new Request('http://localhost/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: 'self@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('yourself')
    })

    it('should return 404 if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const request = new Request('http://localhost/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: 'notfound@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
    })

    it('should create friend request successfully', async () => {
      // First call - profile lookup returns found user
      // Second call - existing friendship check returns null (no existing friendship)
      let callCount = 0
      mockSelect.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Profile lookup
          return {
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'user-456', email: 'friend@example.com' },
                error: null,
              }),
            }),
          }
        } else {
          // Existing friendship check
          return {
            or: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }
        }
      })

      // Mock insert
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-friendship', status: 'pending' },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: 'friend@example.com' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
    })
  })

  describe('PATCH', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/friends', {
        method: 'PATCH',
        body: JSON.stringify({ friendship_id: 'f1', action: 'accept' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if friendship_id is missing', async () => {
      const request = new Request('http://localhost/api/friends', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'accept' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 if action is invalid', async () => {
      const request = new Request('http://localhost/api/friends', {
        method: 'PATCH',
        body: JSON.stringify({ friendship_id: 'f1', action: 'invalid' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(400)
    })

    it('should accept friend request', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'f1', status: 'accepted' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/friends', {
        method: 'PATCH',
        body: JSON.stringify({ friendship_id: 'f1', action: 'accept' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)
    })

    it('should decline friend request', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'f1', status: 'declined' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/friends', {
        method: 'PATCH',
        body: JSON.stringify({ friendship_id: 'f1', action: 'decline' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/friends?friendship_id=f1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if friendship_id is missing', async () => {
      const request = new Request('http://localhost/api/friends', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(400)
    })

    it('should delete friendship successfully', async () => {
      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/friends?friendship_id=f1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(200)
    })
  })
})
