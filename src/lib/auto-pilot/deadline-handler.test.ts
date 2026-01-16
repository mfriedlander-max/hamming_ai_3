import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleMissedDeadline,
  handleUpcomingDeadline,
  handleAllDeadlines,
} from './deadline-handler'
import type { MissedDeadline, UpcomingDeadline, DeadlineCheckResult } from './types'

// Mock notification-sender
vi.mock('./notification-sender', () => ({
  createAutoPilotNotification: vi.fn((type, data) => ({
    type,
    title: `Test ${type}`,
    body: `Test body for ${type}`,
    data,
  })),
  sendAutoPilotNotification: vi.fn(() => Promise.resolve(true)),
}))

// Mock behavior-tracker
vi.mock('./behavior-tracker', () => ({
  updateBehaviorPattern: vi.fn(() => Promise.resolve()),
}))

// Mock Supabase for cache invalidation
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      })),
    })
  ),
}))

describe('deadline-handler', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleMissedDeadline', () => {
    const missed: MissedDeadline = {
      user_id: userId,
      intent_id: 'intent-1',
      intent_title: 'Breaking Bad',
      original_deadline: '2025-02-01',
      missed_by_days: 5,
      suggested_new_deadline: '2025-02-09',
      reason: 'Deadline passed 5 days ago',
    }

    it('sends notification about missed deadline', async () => {
      const { sendAutoPilotNotification } = await import('./notification-sender')

      await handleMissedDeadline(missed, userId)

      expect(sendAutoPilotNotification).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'deadline_missed',
        })
      )
    })

    it('triggers plan regeneration by invalidating cache', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      await handleMissedDeadline(missed, userId)

      expect(createClient).toHaveBeenCalled()
    })

    it('updates behavior pattern', async () => {
      const { updateBehaviorPattern } = await import('./behavior-tracker')

      await handleMissedDeadline(missed, userId)

      expect(updateBehaviorPattern).toHaveBeenCalledWith(userId, {
        missed_deadline_count: expect.any(Number),
      })
    })
  })

  describe('handleUpcomingDeadline', () => {
    it('sends warning notification for urgent deadlines (3 days before)', async () => {
      const { sendAutoPilotNotification } = await import('./notification-sender')

      const urgent: UpcomingDeadline = {
        intent_id: 'intent-2',
        intent_title: 'The Office',
        deadline: '2025-02-13',
        days_until: 3,
        is_urgent: true,
      }

      await handleUpcomingDeadline(urgent, userId)

      expect(sendAutoPilotNotification).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'deadline_warning',
        })
      )
    })

    it('does not notify for non-urgent deadlines', async () => {
      const { sendAutoPilotNotification } = await import('./notification-sender')

      const notUrgent: UpcomingDeadline = {
        intent_id: 'intent-3',
        intent_title: 'Parks and Rec',
        deadline: '2025-02-20',
        days_until: 10,
        is_urgent: false,
      }

      await handleUpcomingDeadline(notUrgent, userId)

      expect(sendAutoPilotNotification).not.toHaveBeenCalled()
    })
  })

  describe('handleAllDeadlines', () => {
    it('processes missed and upcoming correctly', async () => {
      const { sendAutoPilotNotification } = await import('./notification-sender')

      const result: DeadlineCheckResult = {
        missed_deadlines: [
          {
            user_id: userId,
            intent_id: 'intent-1',
            intent_title: 'Breaking Bad',
            original_deadline: '2025-02-01',
            missed_by_days: 5,
            suggested_new_deadline: '2025-02-09',
            reason: 'Deadline passed 5 days ago',
          },
        ],
        upcoming_deadlines: [
          {
            intent_id: 'intent-2',
            intent_title: 'The Office',
            deadline: '2025-02-13',
            days_until: 2,
            is_urgent: true,
          },
          {
            intent_id: 'intent-3',
            intent_title: 'Parks and Rec',
            deadline: '2025-02-20',
            days_until: 10,
            is_urgent: false,
          },
        ],
      }

      const handleResult = await handleAllDeadlines(result, userId)

      // Should handle 1 missed + 1 urgent upcoming = 2 handled
      expect(handleResult.handled).toBe(2)
      // Should send 2 notifications (1 for missed, 1 for urgent)
      expect(handleResult.notifications_sent).toBe(2)
    })
  })
})
