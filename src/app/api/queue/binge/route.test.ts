import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/tmdb/client', () => ({
  createTMDBClient: vi.fn().mockReturnValue({
    getShowDetails: vi.fn().mockResolvedValue({
      number_of_episodes: 8,
      episode_run_time: [45],
      status: 'Ended',
    }),
  }),
}))

const mockUser = { id: 'user-123' }

describe('Binge Queue API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set TMDB API key for tests
    vi.stubEnv('TMDB_API_KEY', 'test-api-key')
  })

  it('returns 401 for unauthenticated requests', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/binge', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('adds show to queue with calculated binge duration', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { watch_speed: 3 },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'queue_items') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'queue-1',
                    user_id: 'user-123',
                    tmdb_id: 12345,
                    title: 'Breaking Bad',
                    content_type: 'tv',
                    service_id: 'service-1',
                    service_name: 'Netflix',
                    duration_minutes: 360,
                    priority: 1,
                    source: 'binge_plan',
                    deadline: '2026-01-18',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/binge', {
      method: 'POST',
      body: JSON.stringify({
        tmdb_id: 12345,
        title: 'Breaking Bad',
        service_id: 'service-1',
        service_name: 'Netflix',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.item.source).toBe('binge_plan')
    expect(data.binge_plan).toBeDefined()
    expect(data.binge_plan.total_episodes).toBe(8)
  })

  it('calculates deadline based on user watch speed', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { watch_speed: 2 },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'queue_items') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'queue-1',
                    user_id: 'user-123',
                    tmdb_id: 12345,
                    title: 'Breaking Bad',
                    source: 'binge_plan',
                    deadline: '2026-01-19',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/binge', {
      method: 'POST',
      body: JSON.stringify({
        tmdb_id: 12345,
        title: 'Breaking Bad',
        service_id: 'service-1',
        service_name: 'Netflix',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.binge_plan.days_to_complete).toBeGreaterThan(0)
  })

  it('returns 400 for missing required fields', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/queue/binge', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345 }), // Missing title, service_id, service_name
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
