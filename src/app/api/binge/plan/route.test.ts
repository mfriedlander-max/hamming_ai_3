import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock TMDB client
vi.mock('@/lib/tmdb/client', () => ({
  createTMDBClient: vi.fn(() => ({
    getShowDetails: vi.fn(),
  })),
}))

import { createClient } from '@/lib/supabase/server'
import { createTMDBClient } from '@/lib/tmdb/client'

const mockUser = { id: 'user-123' }

const mockProfile = {
  id: 'user-123',
  watch_speed: 2,
}

const mockSubscription = {
  id: 'sub-123',
  user_id: 'user-123',
  service_id: 'service-123',
  monthly_cost: 15.99,
  status: 'active',
  service: {
    id: 'service-123',
    name: 'Netflix',
    slug: 'netflix',
  },
}

const mockShowDetails = {
  id: 12345,
  name: 'Test Show',
  number_of_episodes: 10,
  number_of_seasons: 1,
  episode_run_time: [45],
  status: 'Ended',
  first_air_date: '2026-01-01',
  poster_path: '/test.jpg',
  overview: 'A test show',
  genres: [{ id: 18, name: 'Drama' }],
}

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }
      }
      if (table === 'subscriptions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    }),
    ...overrides,
  }
}

describe('POST /api/binge/plan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.TMDB_API_KEY = 'test-tmdb-key'
  })

  it('returns 401 when user is not authenticated', async () => {
    const mockSupabase = createMockSupabase()
    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345, service_id: 'service-123', release_date: '2026-02-01' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when required fields are missing', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345 }), // Missing service_id and release_date
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
  })

  it('returns 404 when subscription is not found', async () => {
    const mockSupabase = createMockSupabase()
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }
      }
      if (table === 'subscriptions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345, service_id: 'nonexistent', release_date: '2026-02-01' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Subscription not found')
  })

  it('returns binge plan successfully', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const mockTMDBClient = {
      getShowDetails: vi.fn().mockResolvedValue(mockShowDetails),
    }
    vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({ tmdb_id: 12345, service_id: 'service-123', release_date: '2026-02-01' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.plan).toBeDefined()
    expect(data.plan.show_id).toBe(12345)
    expect(data.plan.show_title).toBe('Test Show')
    expect(data.plan.service_id).toBe('service-123')
    expect(data.plan.service_name).toBe('Netflix')
    expect(data.plan.total_episodes).toBe(10)
    expect(data.plan.subscribe_date).toBe('2026-01-31')
    expect(data.plan.cancel_date).toBe('2026-02-08')
  })

  it('uses custom watch_speed when provided', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const mockTMDBClient = {
      getShowDetails: vi.fn().mockResolvedValue(mockShowDetails),
    }
    vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({
        tmdb_id: 12345,
        service_id: 'service-123',
        release_date: '2026-02-01',
        watch_speed: 5, // Override profile default of 2
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.plan.watch_speed).toBe(5)
    expect(data.plan.days_to_complete).toBe(2) // ceil(10/5) = 2
  })

  it('uses profile watch_speed when not provided in request', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const mockTMDBClient = {
      getShowDetails: vi.fn().mockResolvedValue(mockShowDetails),
    }
    vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as never)

    const request = new NextRequest('http://localhost/api/binge/plan', {
      method: 'POST',
      body: JSON.stringify({
        tmdb_id: 12345,
        service_id: 'service-123',
        release_date: '2026-02-01',
        // No watch_speed - should use profile default of 2
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.plan.watch_speed).toBe(2) // From profile
    expect(data.plan.days_to_complete).toBe(5) // ceil(10/2) = 5
  })
})
