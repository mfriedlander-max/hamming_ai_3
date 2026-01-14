import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'

// Mock Supabase client
const mockInsert = vi.fn()
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

const mockParams = { id: 'wl-123' }

describe('/api/watchlists/[id]/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockFrom.mockReturnValue({
      insert: mockInsert,
      delete: mockDelete,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
    })
  })

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'POST',
        body: JSON.stringify({ tmdb_id: 550, content_type: 'movie', title: 'Fight Club' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return 400 if required fields are missing', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'POST',
        body: JSON.stringify({ tmdb_id: 550 }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid content_type', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'POST',
        body: JSON.stringify({ tmdb_id: 550, content_type: 'invalid', title: 'Test' }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should add item to watchlist', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'item-1',
              watchlist_id: 'wl-123',
              tmdb_id: 550,
              content_type: 'movie',
              title: 'Fight Club',
            },
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'POST',
        body: JSON.stringify({
          tmdb_id: 550,
          content_type: 'movie',
          title: 'Fight Club',
          poster_path: '/poster.jpg',
        }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.tmdb_id).toBe(550)
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

      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'POST',
        body: JSON.stringify({
          tmdb_id: 550,
          content_type: 'movie',
          title: 'Fight Club',
        }),
      })

      const response = await POST(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const request = new Request('http://localhost/api/watchlists/wl-123/items?item_id=item-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(401)
    })

    it('should return 400 if item_id is missing', async () => {
      const request = new Request('http://localhost/api/watchlists/wl-123/items', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(400)
    })

    it('should delete item from watchlist', async () => {
      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const request = new Request('http://localhost/api/watchlists/wl-123/items?item_id=item-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve(mockParams) })
      expect(response.status).toBe(200)
    })
  })
})
