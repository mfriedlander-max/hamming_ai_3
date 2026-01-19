import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, DELETE } from './route'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockUser = { id: 'user-123' }

const mockQueueItems = [
  {
    id: 'queue-1',
    user_id: 'user-123',
    tmdb_id: 12345,
    title: 'Stranger Things',
    content_type: 'tv',
    service_id: 'service-1',
    service_name: 'Netflix',
    poster_path: '/poster.jpg',
    duration_minutes: 540,
    priority: 1,
    source: 'watchlist',
    deadline: '2026-02-01',
    added_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'queue-2',
    user_id: 'user-123',
    tmdb_id: 67890,
    title: 'The Bear',
    content_type: 'tv',
    service_id: 'service-2',
    service_name: 'Hulu',
    poster_path: '/poster2.jpg',
    duration_minutes: 300,
    priority: 2,
    source: 'friend_share',
    deadline: null,
    added_at: '2026-01-14T10:00:00Z',
  },
]

describe('Queue API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/queue', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('returns queue items for authenticated user', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockQueueItems, error: null }),
              }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.items).toHaveLength(2)
      expect(data.total).toBe(2)
      expect(data.items[0].title).toBe('Stranger Things')
    })
  })

  describe('POST /api/queue', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue', {
        method: 'POST',
        body: JSON.stringify({ tmdb_id: 12345, title: 'Test' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('creates a new queue item', async () => {
      const newItem = {
        tmdb_id: 99999,
        title: 'New Show',
        content_type: 'tv',
        service_id: 'service-1',
        service_name: 'Netflix',
        duration_minutes: 300,
      }

      const createdItem = {
        id: 'queue-3',
        user_id: 'user-123',
        ...newItem,
        poster_path: null,
        priority: 3,
        source: 'manual',
        deadline: null,
        added_at: '2026-01-15T12:00:00Z',
      }

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: createdItem, error: null }),
            }),
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockQueueItems, error: null }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue', {
        method: 'POST',
        body: JSON.stringify(newItem),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.item.title).toBe('New Show')
    })

    it('returns 400 for invalid input', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/queue', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue?id=queue-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(401)
    })

    it('soft-deletes a queue item by setting removed=true', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue?id=queue-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(200)
    })

    it('returns 400 when id is missing', async () => {
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

      const request = new Request('http://localhost/api/queue', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      expect(response.status).toBe(400)
    })
  })
})
