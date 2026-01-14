import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
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

describe('/api/watchlists', () => {
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
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return user watchlists', async () => {
      const mockWatchlists = [
        {
          id: 'wl-1',
          name: 'My Watchlist',
          created_by: 'user-123',
          created_at: '2026-01-10T10:00:00Z',
          watchlist_members: [{ user_id: 'user-123' }, { user_id: 'user-456' }],
          watchlist_items: [{ id: 'item-1' }, { id: 'item-2' }],
        },
      ]

      mockEq.mockResolvedValue({
        data: mockWatchlists,
        error: null,
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.watchlists).toBeDefined()
      expect(data.watchlists[0].member_count).toBe(2)
      expect(data.watchlists[0].item_count).toBe(2)
    })

    it('should return 500 on database error', async () => {
      mockEq.mockResolvedValue({
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

      const request = new Request('http://localhost/api/watchlists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Watchlist' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 if name is missing', async () => {
      const request = new Request('http://localhost/api/watchlists', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should create watchlist and add creator as owner', async () => {
      // Mock watchlist insert
      mockInsert.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'wl-new', name: 'New Watchlist', created_by: 'user-123' },
            error: null,
          }),
        }),
      })

      // Mock member insert (for adding creator as owner)
      mockFrom.mockImplementation((table) => {
        if (table === 'watchlists') {
          return {
            insert: mockInsert,
          }
        }
        if (table === 'watchlist_members') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return { select: mockSelect, insert: mockInsert }
      })

      const request = new Request('http://localhost/api/watchlists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Watchlist' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.id).toBe('wl-new')
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

      const request = new Request('http://localhost/api/watchlists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Watchlist' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
})
