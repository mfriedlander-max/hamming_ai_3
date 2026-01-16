import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock auth user
let mockUser: { id: string } | null = null
let mockPlan: { this_week_actions: unknown[] } | null = null

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
        return {
          insert: vi.fn(() => ({ error: null })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null })),
          })),
        }
      }),
    })
  ),
}))

// Mock action-executor
vi.mock('@/lib/auto-pilot/action-executor', () => ({
  executeActions: vi.fn(() =>
    Promise.resolve({
      actions_executed: 1,
      actions_skipped: 0,
      actions_failed: 0,
      notifications_sent: 1,
      errors: [],
    })
  ),
}))

// Mock deadline modules
vi.mock('@/lib/auto-pilot/deadline-detector', () => ({
  checkDeadlines: vi.fn(() => ({
    missed_deadlines: [],
    upcoming_deadlines: [],
  })),
}))

vi.mock('@/lib/auto-pilot/deadline-handler', () => ({
  handleAllDeadlines: vi.fn(() =>
    Promise.resolve({
      handled: 0,
      notifications_sent: 0,
    })
  ),
}))

describe('POST /api/auto-pilot/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockPlan = null
  })

  it('returns 401 for unauthenticated', async () => {
    mockUser = null

    const request = new Request('http://localhost/api/auto-pilot/execute', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('processes due actions for user', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'pause',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: new Date().toISOString().split('T')[0],
          reason: 'No content',
        },
      ],
    }

    const request = new Request('http://localhost/api/auto-pilot/execute', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.result).toBeDefined()
    expect(data.result.actions_executed).toBeGreaterThanOrEqual(0)
  })

  it('with dry_run returns preview', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [
        {
          type: 'cancel',
          service_id: 'svc-1',
          service_name: 'Hulu',
          date: new Date().toISOString().split('T')[0],
          reason: 'Finished show',
        },
      ],
    }

    const request = new Request('http://localhost/api/auto-pilot/execute', {
      method: 'POST',
      body: JSON.stringify({ dry_run: true }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.dry_run).toBe(true)
    expect(data.would_execute).toBeDefined()
  })

  it('handles no pending actions', async () => {
    mockUser = { id: 'user-123' }
    mockPlan = {
      this_week_actions: [],
    }

    const request = new Request('http://localhost/api/auto-pilot/execute', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.result.actions_executed).toBe(0)
  })
})
