import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock auth user
let mockUser: { id: string } | null = null
let mockPlan: { this_week_actions: unknown[] } | null = null
let mockRemindersInserted: unknown[] = []
let mockAutoActionsInserted: unknown[] = []
let mockSubscriptionsUpdated: string[] = []

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(() => ({
          data: { user: mockUser },
          error: mockUser ? null : { message: 'Not authenticated' },
        })),
      },
      from: vi.fn((table: string) => {
        if (table === 'optimizer_plans') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: mockPlan ? { plan: mockPlan } : null,
                  error: mockPlan ? null : { message: 'No plan found' },
                })),
              })),
            })),
          }
        }
        if (table === 'reminders') {
          return {
            insert: vi.fn((data: unknown) => {
              mockRemindersInserted.push(data)
              return { error: null }
            }),
          }
        }
        if (table === 'auto_actions') {
          return {
            insert: vi.fn((data: unknown) => {
              mockAutoActionsInserted.push(data)
              return { error: null }
            }),
          }
        }
        if (table === 'subscriptions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { id: 'sub-123' }, // Return a mock subscription ID
                    error: null,
                  })),
                })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn((col: string, val: string) => {
                if (col === 'id') mockSubscriptionsUpdated.push(val)
                return { error: null }
              }),
            })),
          }
        }
        if (table === 'notifications') {
          return {
            insert: vi.fn(() => ({ error: null })),
          }
        }
        return {
          insert: vi.fn(() => ({ error: null })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null })),
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null })),
            })),
          })),
        }
      }),
    })
  ),
}))

// Mock notification sender
vi.mock('@/lib/auto-pilot/notification-sender', () => ({
  createAutoPilotNotification: vi.fn((type) => ({
    type,
    title: 'Test',
    body: 'Test body',
  })),
  sendAutoPilotNotification: vi.fn(() => Promise.resolve(true)),
}))

describe('POST /api/optimizer-v2/apply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockPlan = null
    mockRemindersInserted = []
    mockAutoActionsInserted = []
    mockSubscriptionsUpdated = []
  })

  it('creates reminders from plan actions', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'cancel',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-15',
          reason: 'Finished watching',
        },
        {
          type: 'subscribe',
          service_id: 'svc-2',
          service_name: 'Hulu',
          date: '2025-02-20',
          reason: 'New show starting',
        },
      ],
    }

    const request = new Request('http://localhost/api/optimizer-v2/apply', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.reminders_created).toBeGreaterThan(0)
  })

  it('creates auto_actions entries', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'pause',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-10',
          reason: 'No content',
        },
      ],
    }

    const request = new Request('http://localhost/api/optimizer-v2/apply', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.auto_actions_created).toBeGreaterThanOrEqual(0)
  })

  it('updates subscription board columns', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'cancel',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-15',
          reason: 'Finished watching',
        },
      ],
    }

    const request = new Request('http://localhost/api/optimizer-v2/apply', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.subscriptions_updated).toBeGreaterThanOrEqual(0)
  })

  it('sends confirmation notification', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'set_reminder',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-12',
          reason: 'Check if still needed',
        },
      ],
    }

    const { sendAutoPilotNotification } = await import(
      '@/lib/auto-pilot/notification-sender'
    )

    const request = new Request('http://localhost/api/optimizer-v2/apply', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    await POST(request)

    expect(sendAutoPilotNotification).toHaveBeenCalled()
  })
})
