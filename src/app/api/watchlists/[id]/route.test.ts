import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from './route'

// Mock Supabase client
const mockSelect = vi.fn()
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

const mockParams = { id: 'wl-123' }

describe('/api/watchlists/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    })
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123')
      const response = await GET(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return watchlist with items and members', async () => {
      const mockWatchlist = {
        id: 'wl-123',
        name: 'My Watchlist',
        created_by: 'user-123',
        created_at: '2026-01-10T10:00:00Z',
        watchlist_members: [
          { user_id: 'user-123', role: 'owner', joined_at: '2026-01-10T10:00:00Z', profile: { name: 'John' } },
        ],
        watchlist_items: [
          {
            id: 'item-1',
            tmdb_id: 550,
            content_type: 'movie',
            title: 'Fight Club',
            poster_path: '/poster.jpg',
            added_by: 'user-123',
            added_at: '2026-01-11T10:00:00Z',
            adder: { name: 'John' },
          },
        ],
      }

      mockSingle.mockResolvedValue({
        data: mockWatchlist,
        error: null,
      })

      const request = new Request('http://localhost/api/watchlists/wl-123')
      const response = await GET(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.id).toBe('wl-123')
      expect(data.members).toBeDefined()
      expect(data.items).toBeDefined()
    })

    it('should return 404 if watchlist not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const request = new Request('http://localhost/api/watchlists/wl-999')
      const response = await GET(request, { params: Promise.resolve({ id: 'wl-999' }) })
      expect(response.status).toBe(404)
    })
  })

  describe('PATCH', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })

      const response = await PATCH(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return 400 if name is missing', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123', {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      const response = await PATCH(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should update watchlist name', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'wl-123', name: 'New Name' },
              error: null,
            }),
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })

      const response = await PATCH(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.name).toBe('New Name')
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should delete watchlist', async () => {
      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(200)
    })
  })
})
