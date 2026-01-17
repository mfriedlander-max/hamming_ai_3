/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock edge case modules
vi.mock('@/lib/edge-cases/vacation-mode', () => ({
  getVacationStatus: vi.fn(),
  checkAndAutoDisableVacation: vi.fn(),
}))

vi.mock('@/lib/edge-cases/activity-monitor', () => ({
  getActivitySummary: vi.fn(),
}))

vi.mock('@/lib/edge-cases/queue-manager', () => ({
  checkQueueHealth: vi.fn(),
}))

vi.mock('@/lib/edge-cases/price-monitor', () => ({
  checkPriceChanges: vi.fn(),
}))

vi.mock('@/lib/edge-cases/content-monitor', () => ({
  detectContentChanges: vi.fn(),
}))

describe('POST /api/edge-cases/check', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 for unauthenticated', async () => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const response = await POST(new Request('http://localhost/api/edge-cases/check', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(401)
  })

  it('runs all monitors and returns summary', async () => {
    const mockUser = { id: 'user-123' }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const { getVacationStatus, checkAndAutoDisableVacation } = await import('@/lib/edge-cases/vacation-mode')
    vi.mocked(getVacationStatus).mockResolvedValue({
      is_on_vacation: false,
      start_date: null,
      return_date: null,
      days_remaining: null,
    })
    vi.mocked(checkAndAutoDisableVacation).mockResolvedValue(false)

    const { getActivitySummary } = await import('@/lib/edge-cases/activity-monitor')
    vi.mocked(getActivitySummary).mockResolvedValue({
      user_id: 'user-123',
      last_login: '2026-01-17T10:00:00Z',
      last_queue_interaction: null,
      items_completed: 0,
      is_inactive: false,
      days_since_activity: 0,
    })

    const { checkQueueHealth } = await import('@/lib/edge-cases/queue-manager')
    vi.mocked(checkQueueHealth).mockResolvedValue({
      status: 'healthy',
      total_hours_needed: 10,
      available_hours: 20,
      hours_deficit: 0,
    })

    const { checkPriceChanges } = await import('@/lib/edge-cases/price-monitor')
    vi.mocked(checkPriceChanges).mockResolvedValue({
      changes: [],
      significant_changes: [],
    })

    const { detectContentChanges } = await import('@/lib/edge-cases/content-monitor')
    vi.mocked(detectContentChanges).mockResolvedValue({
      changes: [],
      checked_count: 0,
      error_count: 0,
    })

    const response = await POST(new Request('http://localhost/api/edge-cases/check', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('vacation_status')
    expect(data).toHaveProperty('activity_summary')
    expect(data).toHaveProperty('queue_health')
    expect(data).toHaveProperty('price_changes')
    expect(data).toHaveProperty('content_changes')
    expect(data).toHaveProperty('checked_at')
  })

  it('skips checks if user is on vacation', async () => {
    const mockUser = { id: 'user-123' }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const { getVacationStatus, checkAndAutoDisableVacation } = await import('@/lib/edge-cases/vacation-mode')
    vi.mocked(getVacationStatus).mockResolvedValue({
      is_on_vacation: true,
      start_date: '2026-01-15',
      return_date: '2026-01-25',
      days_remaining: 8,
    })
    vi.mocked(checkAndAutoDisableVacation).mockResolvedValue(false)

    const response = await POST(new Request('http://localhost/api/edge-cases/check', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.vacation_status.is_on_vacation).toBe(true)
    expect(data.skipped_due_to_vacation).toBe(true)
  })

  it('handles individual monitor errors gracefully', async () => {
    const mockUser = { id: 'user-123' }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const { getVacationStatus, checkAndAutoDisableVacation } = await import('@/lib/edge-cases/vacation-mode')
    vi.mocked(getVacationStatus).mockResolvedValue({
      is_on_vacation: false,
      start_date: null,
      return_date: null,
      days_remaining: null,
    })
    vi.mocked(checkAndAutoDisableVacation).mockResolvedValue(false)

    const { getActivitySummary } = await import('@/lib/edge-cases/activity-monitor')
    vi.mocked(getActivitySummary).mockRejectedValue(new Error('Database error'))

    const { checkQueueHealth } = await import('@/lib/edge-cases/queue-manager')
    vi.mocked(checkQueueHealth).mockResolvedValue({
      status: 'healthy',
      total_hours_needed: 10,
      available_hours: 20,
      hours_deficit: 0,
    })

    const { checkPriceChanges } = await import('@/lib/edge-cases/price-monitor')
    vi.mocked(checkPriceChanges).mockResolvedValue({
      changes: [],
      significant_changes: [],
    })

    const { detectContentChanges } = await import('@/lib/edge-cases/content-monitor')
    vi.mocked(detectContentChanges).mockResolvedValue({
      changes: [],
      checked_count: 0,
      error_count: 0,
    })

    const response = await POST(new Request('http://localhost/api/edge-cases/check', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    // Should still succeed, with error noted
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.errors).toContain('activity_monitor')
  })

  it('records check timestamp', async () => {
    const mockUser = { id: 'user-123' }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const { getVacationStatus, checkAndAutoDisableVacation } = await import('@/lib/edge-cases/vacation-mode')
    vi.mocked(getVacationStatus).mockResolvedValue({
      is_on_vacation: false,
      start_date: null,
      return_date: null,
      days_remaining: null,
    })
    vi.mocked(checkAndAutoDisableVacation).mockResolvedValue(false)

    const { getActivitySummary } = await import('@/lib/edge-cases/activity-monitor')
    vi.mocked(getActivitySummary).mockResolvedValue({
      user_id: 'user-123',
      last_login: null,
      last_queue_interaction: null,
      items_completed: 0,
      is_inactive: false,
      days_since_activity: 0,
    })

    const { checkQueueHealth } = await import('@/lib/edge-cases/queue-manager')
    vi.mocked(checkQueueHealth).mockResolvedValue({
      status: 'healthy',
      total_hours_needed: 0,
      available_hours: 10,
      hours_deficit: 0,
    })

    const { checkPriceChanges } = await import('@/lib/edge-cases/price-monitor')
    vi.mocked(checkPriceChanges).mockResolvedValue({
      changes: [],
      significant_changes: [],
    })

    const { detectContentChanges } = await import('@/lib/edge-cases/content-monitor')
    vi.mocked(detectContentChanges).mockResolvedValue({
      changes: [],
      checked_count: 0,
      error_count: 0,
    })

    const response = await POST(new Request('http://localhost/api/edge-cases/check', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    const data = await response.json()
    expect(data.checked_at).toBeDefined()
    expect(new Date(data.checked_at)).toBeInstanceOf(Date)
  })
})
