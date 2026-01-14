import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PATCH, DELETE } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
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

vi.mock('@/lib/household/invite', () => ({
  generateInviteCode: vi.fn(() => 'ABCD1234'),
}))

describe('/api/household', () => {
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

    it('should return null if user has no household', async () => {
      // First query for household_members returns no membership
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.household).toBeNull()
    })

    it('should return household with members when user is a member', async () => {
      const mockMembership = {
        household_id: 'household-1',
        household: {
          id: 'household-1',
          name: 'Smith Family',
          created_by: 'user-123',
          invite_code: 'ABCD1234',
          created_at: '2026-01-01T00:00:00Z',
        },
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

      // Mock the chain for first call (membership with household)
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
      expect(data.household).toBeDefined()
      expect(data.household.name).toBe('Smith Family')
      expect(data.household.members).toHaveLength(2)
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/household', {
        method: 'POST',
        body: JSON.stringify({ name: 'My Household' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if name is not provided', async () => {
      const request = new Request('http://localhost/api/household', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 if name is empty', async () => {
      const request = new Request('http://localhost/api/household', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 409 if user is already in a household', async () => {
      // User already has a membership
      mockSingle.mockResolvedValue({
        data: { household_id: 'existing-household' },
        error: null,
      })

      const request = new Request('http://localhost/api/household', {
        method: 'POST',
        body: JSON.stringify({ name: 'My Household' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })

    it('should create household and add user as owner', async () => {
      // No existing membership
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const mockHousehold = {
        id: 'household-1',
        name: 'My Household',
        created_by: 'user-123',
        invite_code: 'ABCD1234',
        created_at: '2026-01-01T00:00:00Z',
      }

      // Insert household
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockHousehold,
            error: null,
          }),
        }),
      })

      // Insert membership
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'member-1',
              household_id: 'household-1',
              user_id: 'user-123',
              role: 'owner',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/household', {
        method: 'POST',
        body: JSON.stringify({ name: 'My Household' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.id).toBe('household-1')
      expect(data.name).toBe('My Household')
      expect(data.invite_code).toBe('ABCD1234')
    })
  })

  describe('PATCH', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/household', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if name is not provided', async () => {
      const request = new Request('http://localhost/api/household', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(400)
    })

    it('should return 404 if user is not in a household', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const request = new Request('http://localhost/api/household', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(404)
    })

    it('should return 403 if user is not the owner', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'member' },
        error: null,
      })

      const request = new Request('http://localhost/api/household', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(403)
    })

    it('should update household name when user is owner', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'owner' },
        error: null,
      })

      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'household-1', name: 'Updated Name' },
              error: null,
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/household', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.name).toBe('Updated Name')
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await DELETE()
      expect(response.status).toBe(401)
    })

    it('should return 404 if user is not in a household', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const response = await DELETE()
      expect(response.status).toBe(404)
    })

    it('should return 403 if user is not the owner', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'member' },
        error: null,
      })

      const response = await DELETE()
      expect(response.status).toBe(403)
    })

    it('should delete household when user is owner', async () => {
      mockSingle.mockResolvedValue({
        data: { household_id: 'household-1', role: 'owner' },
        error: null,
      })

      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      })

      const response = await DELETE()
      expect(response.status).toBe(200)
    })
  })
})
