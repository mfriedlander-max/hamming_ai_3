import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockUser = { id: 'user-123' }

describe('Calendar Actions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for unauthenticated requests', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({ action: 'apply_all' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('applies all optimizer actions', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'optimizer_plans') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'plan-1',
                    plan: {
                      this_week_actions: [
                        { type: 'cancel', service_id: 'service-1', service_name: 'Netflix', date: '2026-01-20', reason: 'No content' },
                      ],
                    },
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'reminders') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        if (table === 'subscriptions') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'sub-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({ action: 'apply_all' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.actions_applied).toBeGreaterThanOrEqual(0)
  })

  it('regenerates optimizer plan', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'optimizer_plans') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({ action: 'regenerate' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.message).toContain('regenerat')
  })

  it('adds release to queue', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
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
                    title: 'New Show',
                    tmdb_id: 99999,
                    source: 'manual',
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

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_to_queue',
        release: {
          id: 'release-1',
          tmdb_id: 99999,
          title: 'New Show',
          content_type: 'tv',
          service_id: 'service-1',
          service_name: 'Netflix',
          duration_minutes: 300,
        },
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.item).toBeDefined()
  })

  it('sets reminder for release', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'sub-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'reminders') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'reminder-1',
                    type: 'resubscribe',
                    trigger_date: '2026-01-20',
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

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'set_reminder',
        release_date: '2026-01-20',
        service_id: 'service-1',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.reminder).toBeDefined()
  })

  it('returns 400 for unknown action', async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never)

    const request = new Request('http://localhost/api/calendar/actions', {
      method: 'POST',
      body: JSON.stringify({ action: 'unknown_action' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
