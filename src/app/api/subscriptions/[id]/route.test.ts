import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock notification generator
vi.mock('@/lib/notifications/generator', () => ({
  createResubscribeNotification: vi.fn(() => ({
    user_id: 'user-123',
    type: 'resubscribe_reminder',
    title: 'Reminder Set',
    body: "We'll remind you to resubscribe",
    data: { service_name: 'Netflix', subscription_id: 'sub-1' },
  })),
}))

import { createClient } from '@/lib/supabase/server'

const mockCreateClient = createClient as unknown as ReturnType<typeof vi.fn>

describe('PATCH /api/subscriptions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates subscription status', async () => {
    const mockUser = { id: 'user-123' }
    const mockSubscription = {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      status: 'paused',
      monthly_cost: 15.99,
      created_at: '2024-01-01T00:00:00Z',
      board_column: 'active',
      service: {
        id: 'service-1',
        name: 'Netflix',
        slug: 'netflix',
        logo_url: null,
        default_price: 15.99,
        tmdb_provider_id: 8,
        cancel_url: null,
      },
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
              }),
            }),
          }),
        }),
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paused' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('paused')
  })

  it('updates subscription board_column', async () => {
    const mockUser = { id: 'user-123' }
    const mockSubscription = {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      status: 'active',
      monthly_cost: 15.99,
      created_at: '2024-01-01T00:00:00Z',
      board_column: 'consider',
      service: {
        id: 'service-1',
        name: 'Netflix',
        slug: 'netflix',
        logo_url: null,
        default_price: 15.99,
        tmdb_provider_id: 8,
        cancel_url: null,
      },
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
              }),
            }),
          }),
        }),
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ board_column: 'consider' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.board_column).toBe('consider')
  })

  it('rejects invalid board_column value', async () => {
    const mockUser = { id: 'user-123' }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ board_column: 'invalid' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('board_column')
  })

  it('rejects request with neither status nor board_column', async () => {
    const mockUser = { id: 'user-123' }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })

    expect(response.status).toBe(400)
  })

  it('returns 401 for unauthenticated requests', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'No user' } }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paused' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })

    expect(response.status).toBe(401)
  })

  it('creates auto-reminder when moving to paused board', async () => {
    const mockUser = { id: 'user-123' }
    const mockSubscription = {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      status: 'paused',
      monthly_cost: 15.99,
      created_at: '2024-01-01T00:00:00Z',
      board_column: 'paused',
      service: {
        id: 'service-1',
        name: 'Netflix',
        slug: 'netflix',
        logo_url: null,
        default_price: 15.99,
        tmdb_provider_id: 8,
        cancel_url: null,
      },
    }

    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockPrefsSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { resubscribe_reminder: true }, error: null }),
      }),
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table) => {
        if (table === 'notification_preferences') {
          return { select: mockPrefsSelect }
        }
        if (table === 'reminders' || table === 'notifications') {
          return { insert: mockInsert }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
                }),
              }),
            }),
          }),
        }
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ board_column: 'paused' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })

    expect(response.status).toBe(200)
    // Verify reminder was created (called at least once for reminders table)
    expect(mockInsert).toHaveBeenCalled()
  })

  it('uses provided resume_date for auto-reminder', async () => {
    const mockUser = { id: 'user-123' }
    const mockSubscription = {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      status: 'paused',
      monthly_cost: 15.99,
      created_at: '2024-01-01T00:00:00Z',
      board_column: 'paused',
      service: {
        id: 'service-1',
        name: 'Netflix',
        slug: 'netflix',
        logo_url: null,
        default_price: 15.99,
        tmdb_provider_id: 8,
        cancel_url: null,
      },
    }

    const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockPrefsSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }),
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table) => {
        if (table === 'notification_preferences') {
          return { select: mockPrefsSelect }
        }
        if (table === 'reminders' || table === 'notifications') {
          return { insert: mockInsert }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
                }),
              }),
            }),
          }),
        }
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ board_column: 'paused', resume_date: '2026-04-01' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })

    expect(response.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
  })

  it('respects notification preferences when creating auto-reminder', async () => {
    const mockUser = { id: 'user-123' }
    const mockSubscription = {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      status: 'paused',
      monthly_cost: 15.99,
      created_at: '2024-01-01T00:00:00Z',
      board_column: 'paused',
      service: {
        id: 'service-1',
        name: 'Netflix',
        slug: 'netflix',
        logo_url: null,
        default_price: 15.99,
        tmdb_provider_id: 8,
        cancel_url: null,
      },
    }

    const reminderInsert = vi.fn().mockResolvedValue({ data: null, error: null })
    const notificationInsert = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockPrefsSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { resubscribe_reminder: false }, error: null }),
      }),
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table) => {
        if (table === 'notification_preferences') {
          return { select: mockPrefsSelect }
        }
        if (table === 'reminders') {
          return { insert: reminderInsert }
        }
        if (table === 'notifications') {
          return { insert: notificationInsert }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
                }),
              }),
            }),
          }),
        }
      }),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost/api/subscriptions/sub-1', {
      method: 'PATCH',
      body: JSON.stringify({ board_column: 'paused' }),
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'sub-1' }) })

    expect(response.status).toBe(200)
    // Reminder should still be created
    expect(reminderInsert).toHaveBeenCalled()
    // Notification should NOT be created (preference is false)
    expect(notificationInsert).not.toHaveBeenCalled()
  })
})
