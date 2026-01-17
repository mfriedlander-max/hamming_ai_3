/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  recordLogin,
  recordQueueInteraction,
  recordItemCompletion,
  getActivitySummary,
  isUserInactive,
} from './activity-monitor'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('activity-monitor', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-17T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('recordLogin', () => {
    it('records login activity', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(recordLogin('user-123')).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_behavior_patterns')
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          last_login_date: expect.any(String),
        }),
        expect.any(Object)
      )
    })
  })

  describe('recordQueueInteraction', () => {
    it('records queue interaction', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(recordQueueInteraction('user-123')).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('user_behavior_patterns')
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          last_queue_interaction: expect.any(String),
        }),
        expect.any(Object)
      )
    })
  })

  describe('recordItemCompletion', () => {
    it('records item completion', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { items_completed_count: 5 },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(recordItemCompletion('user-123')).resolves.not.toThrow()
    })
  })

  describe('getActivitySummary', () => {
    it('returns activity summary for user', async () => {
      const mockPattern = {
        user_id: 'user-123',
        last_login_date: '2026-01-16T10:00:00Z',
        last_queue_interaction: '2026-01-15T10:00:00Z',
        items_completed_count: 10,
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPattern,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const summary = await getActivitySummary('user-123')

      expect(summary).toMatchObject({
        user_id: 'user-123',
        last_login: '2026-01-16T10:00:00Z',
        last_queue_interaction: '2026-01-15T10:00:00Z',
        items_completed: 10,
        is_inactive: false,
        days_since_activity: 1,
      })
    })
  })

  describe('isUserInactive', () => {
    it('detects inactive user (>7 days no activity)', async () => {
      // Last activity was 10 days ago
      const mockPattern = {
        user_id: 'user-123',
        last_login_date: '2026-01-07T10:00:00Z', // 10 days ago
        last_queue_interaction: '2026-01-05T10:00:00Z', // 12 days ago
        items_completed_count: 5,
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPattern,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const inactive = await isUserInactive('user-123')

      expect(inactive).toBe(true)
    })

    it('returns false for active user', async () => {
      // Last activity was 2 days ago
      const mockPattern = {
        user_id: 'user-123',
        last_login_date: '2026-01-15T10:00:00Z', // 2 days ago
        last_queue_interaction: '2026-01-14T10:00:00Z',
        items_completed_count: 5,
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPattern,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const inactive = await isUserInactive('user-123')

      expect(inactive).toBe(false)
    })
  })
})
