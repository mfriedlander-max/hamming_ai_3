/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkQueueHealth,
  getItemsToRemoveForCapacity,
  hasDeadlineConflicts,
} from './queue-manager'
import type { QueueItem } from '@/lib/queue/types'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('queue-manager', () => {
  const mockQueueItems: QueueItem[] = [
    {
      id: 'queue-1',
      user_id: 'user-123',
      tmdb_id: 12345,
      title: 'Breaking Bad',
      content_type: 'tv',
      service_id: 'service-1',
      service_name: 'Netflix',
      poster_path: '/poster.jpg',
      duration_minutes: 2700, // 45 hours
      priority: 1, // highest priority
      source: 'watchlist',
      deadline: '2026-02-01',
      added_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'queue-2',
      user_id: 'user-123',
      tmdb_id: 67890,
      title: 'The Dark Knight',
      content_type: 'movie',
      service_id: 'service-2',
      service_name: 'HBO Max',
      poster_path: '/dark-knight.jpg',
      duration_minutes: 152, // 2.5 hours
      priority: 2,
      source: 'taste_match',
      deadline: null,
      added_at: '2026-01-16T10:00:00Z',
    },
    {
      id: 'queue-3',
      user_id: 'user-123',
      tmdb_id: 11111,
      title: 'Some Movie',
      content_type: 'movie',
      service_id: 'service-1',
      service_name: 'Netflix',
      poster_path: '/some.jpg',
      duration_minutes: 120, // 2 hours
      priority: 3, // lowest priority
      source: 'manual',
      deadline: null,
      added_at: '2026-01-17T10:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkQueueHealth', () => {
    it('detects overloaded queue (hours > available)', async () => {
      // User has 10 hours available, but queue needs 49.5 hours
      const mockBehaviorPattern = {
        avg_watch_hours_per_week: 10,
      }

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'queue_items') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockQueueItems,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'user_behavior_patterns') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockBehaviorPattern,
                    error: null,
                  }),
                }),
              }),
            }
          }
          return { select: vi.fn() }
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const health = await checkQueueHealth('user-123')

      expect(health.status).toBe('overloaded')
      expect(health.total_hours_needed).toBeCloseTo(49.53, 1)
      expect(health.available_hours).toBe(10)
      expect(health.hours_deficit).toBeGreaterThan(0)
    })

    it('returns healthy status when queue fits', async () => {
      // User has 100 hours available, queue only needs ~50
      const mockBehaviorPattern = {
        avg_watch_hours_per_week: 100,
      }

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'queue_items') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockQueueItems,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === 'user_behavior_patterns') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockBehaviorPattern,
                    error: null,
                  }),
                }),
              }),
            }
          }
          return { select: vi.fn() }
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const health = await checkQueueHealth('user-123')

      expect(health.status).toBe('healthy')
      expect(health.hours_deficit).toBe(0)
    })
  })

  describe('getItemsToRemoveForCapacity', () => {
    it('calculates hours deficit correctly', () => {
      // Need to free 40 hours
      const itemsToRemove = getItemsToRemoveForCapacity(mockQueueItems, 40)

      // Should suggest removing lowest priority items first
      // queue-3 (2 hours) + queue-2 (2.5 hours) = 4.5 hours... not enough
      // Need to include queue-1 (45 hours)
      expect(itemsToRemove.length).toBeGreaterThan(0)
    })

    it('suggests items to remove by lowest priority', () => {
      // Need to free 3 hours
      const itemsToRemove = getItemsToRemoveForCapacity(mockQueueItems, 3)

      // Should suggest queue-3 first (priority 3, 2 hours)
      // Then queue-2 (priority 2, 2.5 hours) to get enough
      expect(itemsToRemove[0].id).toBe('queue-3') // Lowest priority first
    })
  })

  describe('hasDeadlineConflicts', () => {
    it('accounts for deadlines in overload detection', () => {
      // Breaking Bad has deadline 2026-02-01, needs 45 hours
      // If user only has 10 hours/week, they can't finish in time
      const conflicts = hasDeadlineConflicts(mockQueueItems, 10)

      expect(conflicts).toContain('Breaking Bad')
    })

    it('returns empty when no deadline conflicts', () => {
      // With 100 hours/week, can easily finish everything
      const conflicts = hasDeadlineConflicts(mockQueueItems, 100)

      expect(conflicts).toHaveLength(0)
    })
  })
})
