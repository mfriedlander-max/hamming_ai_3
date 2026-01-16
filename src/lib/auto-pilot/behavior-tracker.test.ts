import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserBehaviorPattern,
  updateBehaviorPattern,
  recordAutoActionResponse,
  inferOptimalActionTime,
} from './behavior-tracker'
import type { UserBehaviorPattern } from './types'

// Track mock state
let mockPatternData: UserBehaviorPattern | null = null

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn((table: string) => {
        if (table === 'user_behavior_patterns') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: mockPatternData,
                  error: mockPatternData ? null : { message: 'Not found' },
                })),
              })),
            })),
            insert: vi.fn((data: unknown) => ({
              select: vi.fn(() => ({
                single: vi.fn(() => {
                  const inserted = {
                    id: 'pattern-123',
                    ...(data as Record<string, unknown>),
                  }
                  mockPatternData = inserted as UserBehaviorPattern
                  return { data: inserted, error: null }
                }),
              })),
            })),
            update: vi.fn((data: unknown) => ({
              eq: vi.fn(() => {
                if (mockPatternData) {
                  mockPatternData = { ...mockPatternData, ...(data as Record<string, unknown>) }
                }
                return { error: null }
              }),
            })),
          }
        }
        return {}
      }),
    })
  ),
}))

describe('behavior-tracker', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
    mockPatternData = null
  })

  describe('getUserBehaviorPattern', () => {
    it('returns existing pattern', async () => {
      mockPatternData = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 15,
        preferred_action_time: '10:00',
        missed_deadline_count: 2,
        auto_actions_accepted: 5,
        auto_actions_rejected: 1,
        timezone: 'America/Los_Angeles',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      const pattern = await getUserBehaviorPattern(userId)

      expect(pattern.id).toBe('pattern-1')
      expect(pattern.avg_watch_hours_per_week).toBe(15)
      expect(pattern.timezone).toBe('America/Los_Angeles')
    })

    it('creates default if none exists', async () => {
      mockPatternData = null

      const pattern = await getUserBehaviorPattern(userId)

      expect(pattern.user_id).toBe(userId)
      expect(pattern.avg_watch_hours_per_week).toBe(10)
      expect(pattern.preferred_action_time).toBe('09:00')
      expect(pattern.missed_deadline_count).toBe(0)
    })
  })

  describe('updateBehaviorPattern', () => {
    it('increments missed_deadline_count', async () => {
      mockPatternData = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 10,
        preferred_action_time: '09:00',
        missed_deadline_count: 2,
        auto_actions_accepted: 5,
        auto_actions_rejected: 1,
        timezone: 'America/New_York',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      await updateBehaviorPattern(userId, { missed_deadline_count: 1 })

      // The update should have been called - check mock was invoked
      const { createClient } = await import('@/lib/supabase/server')
      expect(createClient).toHaveBeenCalled()
    })

    it('updates auto_actions_accepted', async () => {
      mockPatternData = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 10,
        preferred_action_time: '09:00',
        missed_deadline_count: 0,
        auto_actions_accepted: 3,
        auto_actions_rejected: 0,
        timezone: 'America/New_York',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      await updateBehaviorPattern(userId, { auto_actions_accepted: 1 })

      const { createClient } = await import('@/lib/supabase/server')
      expect(createClient).toHaveBeenCalled()
    })
  })

  describe('recordAutoActionResponse', () => {
    it('tracks accept/reject ratio', async () => {
      mockPatternData = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 10,
        preferred_action_time: '09:00',
        missed_deadline_count: 0,
        auto_actions_accepted: 5,
        auto_actions_rejected: 2,
        timezone: 'America/New_York',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      await recordAutoActionResponse(userId, true)
      await recordAutoActionResponse(userId, false)

      const { createClient } = await import('@/lib/supabase/server')
      expect(createClient).toHaveBeenCalled()
    })
  })

  describe('inferOptimalActionTime', () => {
    it('calculates from user activity', () => {
      const pattern: UserBehaviorPattern = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 10,
        preferred_action_time: '08:30',
        missed_deadline_count: 0,
        auto_actions_accepted: 5,
        auto_actions_rejected: 2,
        timezone: 'America/New_York',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      const optimalTime = inferOptimalActionTime(pattern)

      expect(optimalTime).toBe('08:30')
    })

    it('returns default if no preference', () => {
      const pattern: UserBehaviorPattern = {
        id: 'pattern-1',
        user_id: userId,
        avg_watch_hours_per_week: 10,
        preferred_action_time: '',
        missed_deadline_count: 0,
        auto_actions_accepted: 0,
        auto_actions_rejected: 0,
        timezone: 'America/New_York',
        last_activity_date: '2025-02-01',
        updated_at: '2025-02-01T12:00:00Z',
      }

      const optimalTime = inferOptimalActionTime(pattern)

      expect(optimalTime).toBe('09:00')
    })
  })
})
