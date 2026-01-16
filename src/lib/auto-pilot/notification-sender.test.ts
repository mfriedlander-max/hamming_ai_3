import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAutoPilotNotification, sendAutoPilotNotification } from './notification-sender'
import type { AutoPilotNotification } from './types'

// Track mock profile data
let mockProfileData: { notification_preferences: Record<string, boolean> | null } | null = null
let mockInsertCalled = false

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: mockProfileData,
                  error: mockProfileData ? null : { message: 'Not found' },
                })),
              })),
            })),
          }
        }
        if (table === 'notifications') {
          return {
            insert: vi.fn(() => {
              mockInsertCalled = true
              return { error: null }
            }),
          }
        }
        return {}
      }),
    })
  ),
}))

describe('notification-sender', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    mockProfileData = null
    mockInsertCalled = false
  })

  describe('createAutoPilotNotification', () => {
    it('creates action_executed notification', () => {
      const notification = createAutoPilotNotification('action_executed', {
        service_name: 'Netflix',
        action_id: 'action-123',
        service_id: 'svc-1',
      })

      expect(notification.type).toBe('action_executed')
      expect(notification.title).toContain('Netflix')
      expect(notification.body).toContain('Netflix')
      expect(notification.data?.action_id).toBe('action-123')
    })

    it('creates deadline_warning notification', () => {
      const notification = createAutoPilotNotification('deadline_warning', {
        title: 'Breaking Bad',
        days_until: 3,
        deadline: '2025-02-15',
        intent_id: 'intent-1',
      })

      expect(notification.type).toBe('deadline_warning')
      expect(notification.title).toContain('3')
      expect(notification.title).toContain('Breaking Bad')
      expect(notification.data?.intent_id).toBe('intent-1')
    })
  })

  describe('sendAutoPilotNotification', () => {
    const notification: AutoPilotNotification = {
      type: 'action_executed',
      title: 'Test title',
      body: 'Test body',
      data: { action_id: 'action-123' },
    }

    it('respects user preferences - disabled', async () => {
      mockProfileData = {
        notification_preferences: { auto_pilot: false },
      }

      const result = await sendAutoPilotNotification(userId, notification)

      expect(result).toBe(false)
      expect(mockInsertCalled).toBe(false)
    })

    it('inserts into notifications table when enabled', async () => {
      mockProfileData = {
        notification_preferences: { auto_pilot: true },
      }

      const result = await sendAutoPilotNotification(userId, notification)

      expect(result).toBe(true)
      expect(mockInsertCalled).toBe(true)
    })

    it('defaults to enabled if no preferences set', async () => {
      mockProfileData = {
        notification_preferences: null,
      }

      const result = await sendAutoPilotNotification(userId, notification)

      expect(result).toBe(true)
      expect(mockInsertCalled).toBe(true)
    })
  })
})
