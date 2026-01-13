import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { POST } from './route'
import type { OptimizedSchedule } from '@/lib/optimizer/types'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

describe('/api/optimizer/apply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validSchedule: OptimizedSchedule = {
    current_annual_cost: 191.88,
    optimized_annual_cost: 95.94,
    savings: 95.94,
    months: [
      {
        month: '2026-01',
        actions: [
          {
            service_id: 'svc-1',
            service_name: 'Netflix',
            action: 'cancel',
            date: '2026-01-15',
            reason: 'No matching content',
          },
        ],
        active_services: [],
        monthly_cost: 0,
      },
      {
        month: '2026-02',
        actions: [
          {
            service_id: 'svc-1',
            service_name: 'Netflix',
            action: 'subscribe',
            date: '2026-02-01',
            reason: 'New content arriving',
          },
        ],
        active_services: ['svc-1'],
        monthly_cost: 15.99,
      },
    ],
  }

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const request = new Request('http://localhost/api/optimizer/apply', {
        method: 'POST',
        body: JSON.stringify({ schedule: validSchedule }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when schedule is missing', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new Request('http://localhost/api/optimizer/apply', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('schedule')
    })

    it('creates reminders for subscribe and cancel actions', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', service_id: 'svc-1' },
      ]

      const insertedReminders: unknown[] = []
      const updatedSubscriptions: unknown[] = []

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation(() => {
                  updatedSubscriptions.push({})
                  return Promise.resolve({ error: null })
                }),
              }),
            }
          }
          if (table === 'reminders') {
            return {
              insert: vi.fn().mockImplementation((data) => {
                insertedReminders.push(...(Array.isArray(data) ? data : [data]))
                return Promise.resolve({ error: null })
              }),
            }
          }
          return {}
        }),
      })

      const request = new Request('http://localhost/api/optimizer/apply', {
        method: 'POST',
        body: JSON.stringify({ schedule: validSchedule }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reminders_created).toBe(2) // cancel + subscribe
      expect(insertedReminders).toHaveLength(2)
    })

    it('updates subscription board_column to scheduled', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', service_id: 'svc-1' },
      ]

      let boardColumnUpdated = false

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockSubscriptions,
                  error: null,
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation(() => {
                  boardColumnUpdated = true
                  return Promise.resolve({ error: null })
                }),
              }),
            }
          }
          if (table === 'reminders') {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            }
          }
          return {}
        }),
      })

      const request = new Request('http://localhost/api/optimizer/apply', {
        method: 'POST',
        body: JSON.stringify({ schedule: validSchedule }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(boardColumnUpdated).toBe(true)
      expect(data.subscriptions_updated).toBeGreaterThan(0)
    })

    it('handles empty schedule with no actions', async () => {
      const emptySchedule: OptimizedSchedule = {
        current_annual_cost: 0,
        optimized_annual_cost: 0,
        savings: 0,
        months: [],
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        })),
      })

      const request = new Request('http://localhost/api/optimizer/apply', {
        method: 'POST',
        body: JSON.stringify({ schedule: emptySchedule }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reminders_created).toBe(0)
      expect(data.subscriptions_updated).toBe(0)
    })
  })
})
