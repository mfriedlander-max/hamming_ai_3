import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
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

describe('/api/household/invite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      single: mockSingle,
    })
  })

  describe('GET', () => {
    it('should return 400 if invite code is not provided', async () => {
      const request = new Request('http://localhost/api/household/invite')

      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 if invite code is invalid format', async () => {
      const request = new Request('http://localhost/api/household/invite?code=invalid')

      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('should return 404 if household is not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const request = new Request('http://localhost/api/household/invite?code=ABCD1234')

      const response = await GET(request)
      expect(response.status).toBe(404)
    })

    it('should return household info for valid invite code', async () => {
      const mockHousehold = {
        id: 'household-1',
        name: 'Smith Family',
        created_at: '2026-01-01T00:00:00Z',
      }

      mockSingle.mockResolvedValue({
        data: mockHousehold,
        error: null,
      })

      const request = new Request('http://localhost/api/household/invite?code=ABCD1234')

      const response = await GET(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.id).toBe('household-1')
      expect(data.name).toBe('Smith Family')
      // Should not expose invite code in response
      expect(data.invite_code).toBeUndefined()
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({ invite_code: 'ABCD1234' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if invite code is not provided', async () => {
      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 if invite code is invalid format', async () => {
      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({ invite_code: 'invalid' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 409 if user is already in a household', async () => {
      // First call: check existing membership
      mockSingle.mockResolvedValueOnce({
        data: { household_id: 'existing-household' },
        error: null,
      })

      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({ invite_code: 'ABCD1234' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })

    it('should return 404 if household not found for invite code', async () => {
      // No existing membership
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Household lookup fails
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({ invite_code: 'ABCD1234' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
    })

    it('should join household successfully', async () => {
      // No existing membership
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      // Household found
      mockSingle.mockResolvedValueOnce({
        data: { id: 'household-1', name: 'Smith Family' },
        error: null,
      })

      // Insert membership
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'member-1',
              household_id: 'household-1',
              user_id: 'user-123',
              role: 'member',
              joined_at: '2026-01-01T00:00:00Z',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/household/invite', {
        method: 'POST',
        body: JSON.stringify({ invite_code: 'ABCD1234', display_name: 'John' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.household_id).toBe('household-1')
    })
  })
})
