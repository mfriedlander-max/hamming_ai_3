import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, DELETE } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockDelete = vi.fn()
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

describe('/api/household/members', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      delete: mockDelete,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      single: mockSingle,
      eq: mockEq,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return 404 if user is not in a household', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const response = await GET()
      expect(response.status).toBe(404)
    })

    it('should return members list with profiles', async () => {
      const mockMembership = {
        household_id: 'household-1',
      }

      const mockMembers = [
        {
          id: 'member-1',
          household_id: 'household-1',
          user_id: 'user-123',
          role: 'owner',
          display_name: 'John',
          joined_at: '2026-01-01T00:00:00Z',
          profile: { id: 'user-123', name: 'John Smith' },
        },
        {
          id: 'member-2',
          household_id: 'household-1',
          user_id: 'user-456',
          role: 'member',
          display_name: 'Jane',
          joined_at: '2026-01-02T00:00:00Z',
          profile: { id: 'user-456', name: 'Jane Smith' },
        },
      ]

      // Mock the chain for first call (user's membership)
      const mockFirstSingle = vi.fn().mockResolvedValue({
        data: mockMembership,
        error: null,
      })
      const mockFirstEq = vi.fn().mockReturnValue({
        single: mockFirstSingle,
      })
      const mockFirstSelect = vi.fn().mockReturnValue({
        eq: mockFirstEq,
      })

      // Mock the chain for second call (members list)
      const mockSecondEq = vi.fn().mockResolvedValue({
        data: mockMembers,
        error: null,
      })
      const mockSecondSelect = vi.fn().mockReturnValue({
        eq: mockSecondEq,
      })

      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { select: mockFirstSelect }
        }
        return { select: mockSecondSelect }
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.members).toHaveLength(2)
      expect(data.members[0].role).toBe('owner')
      expect(data.members[1].role).toBe('member')
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/household/members?user_id=user-456')

      const response = await DELETE(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if user_id is not provided', async () => {
      const request = new Request('http://localhost/api/household/members')

      const response = await DELETE(request)
      expect(response.status).toBe(400)
    })

    it('should return 404 if current user is not in a household', async () => {
      // Mock chain for select -> eq -> single
      const mockSingleForDelete = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockEqForDelete = vi.fn().mockReturnValue({
        single: mockSingleForDelete,
      })
      const mockSelectForDelete = vi.fn().mockReturnValue({
        eq: mockEqForDelete,
      })
      mockFrom.mockReturnValue({
        select: mockSelectForDelete,
        delete: mockDelete,
      })

      const request = new Request('http://localhost/api/household/members?user_id=user-456')

      const response = await DELETE(request)
      expect(response.status).toBe(404)
    })

    it('should allow user to leave their own household (self)', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'member' },
        error: null,
      })

      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/household/members?user_id=user-123')

      const response = await DELETE(request)
      expect(response.status).toBe(200)
    })

    it('should return 403 if non-owner tries to remove another member', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'member' },
        error: null,
      })

      const request = new Request('http://localhost/api/household/members?user_id=user-456')

      const response = await DELETE(request)
      expect(response.status).toBe(403)
    })

    it('should allow owner to remove another member', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'owner' },
        error: null,
      })

      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/household/members?user_id=user-456')

      const response = await DELETE(request)
      expect(response.status).toBe(200)
    })

    it('should return 400 if owner tries to leave (must transfer or delete household)', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'owner' },
        error: null,
      })

      const request = new Request('http://localhost/api/household/members?user_id=user-123')

      const response = await DELETE(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toContain('owner')
    })
  })
})
