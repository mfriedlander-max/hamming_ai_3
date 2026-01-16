import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockUser = { id: 'user-123' }

describe('Watch Together API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for unauthenticated requests', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/watch-together', {
      method: 'POST',
      body: JSON.stringify({ queue_item_id: 'queue-1', friend_ids: ['friend-1'] }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('creates watch-together session with friends', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'queue_items') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: 'queue-1',
                      title: 'Stranger Things',
                      tmdb_id: 12345,
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'watch_together_sessions') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'session-1',
                    queue_item_id: 'queue-1',
                    organizer_id: 'user-123',
                    participant_ids: ['friend-1', 'friend-2'],
                    status: 'pending',
                    created_at: '2026-01-15T10:00:00Z',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'notifications') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/watch-together', {
      method: 'POST',
      body: JSON.stringify({
        queue_item_id: 'queue-1',
        friend_ids: ['friend-1', 'friend-2'],
        scheduled_date: '2026-01-20',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.session).toBeDefined()
    expect(data.session.participant_ids).toHaveLength(2)
  })

  it('sends notifications to invited friends', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'queue_items') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'queue-1', title: 'The Bear', tmdb_id: 67890 },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'watch_together_sessions') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'session-1',
                    queue_item_id: 'queue-1',
                    organizer_id: 'user-123',
                    participant_ids: ['friend-1'],
                    status: 'pending',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'notifications') {
          return { insert: insertMock }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/watch-together', {
      method: 'POST',
      body: JSON.stringify({
        queue_item_id: 'queue-1',
        friend_ids: ['friend-1'],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(insertMock).toHaveBeenCalled()
  })

  it('returns 400 for missing required fields', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/watch-together', {
      method: 'POST',
      body: JSON.stringify({ queue_item_id: 'queue-1' }), // Missing friend_ids
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
