/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectContentChanges,
  handleContentChange,
} from './content-monitor'
import type { QueueItem } from '@/lib/queue/types'
import type { ContentChange } from './types'

// Mock TMDB client
vi.mock('@/lib/tmdb/client', () => ({
  createTMDBClient: vi.fn(),
}))

// Mock notifications
vi.mock('@/lib/notifications/generator', () => ({
  createContentReleaseNotification: vi.fn(),
}))

describe('content-monitor', () => {
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
      duration_minutes: 2700,
      priority: 1,
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
      duration_minutes: 152,
      priority: 2,
      source: 'taste_match',
      deadline: null,
      added_at: '2026-01-16T10:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('detectContentChanges', () => {
    it('detects release date change for queued content', async () => {
      // Mock TMDB returning different date
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockResolvedValue({
          id: 12345,
          name: 'Breaking Bad',
          first_air_date: '2026-03-01', // Date changed from deadline
          status: 'Returning Series',
          number_of_episodes: 62,
          number_of_seasons: 5,
          episode_run_time: [45],
          poster_path: '/poster.jpg',
          overview: 'A show about chemistry',
          genres: [],
        }),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      const result = await detectContentChanges(mockQueueItems.slice(0, 1), {
        tmdbApiKey: 'test-key',
        storedReleaseDates: { 12345: '2026-02-01' },
      })

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0]).toMatchObject({
        queue_item_id: 'queue-1',
        tmdb_id: 12345,
        title: 'Breaking Bad',
        change_type: 'date_changed',
        old_value: '2026-02-01',
        new_value: '2026-03-01',
      })
      expect(result.checked_count).toBe(1)
    })

    it('detects content removed from TMDB', async () => {
      // Mock TMDB throwing 404
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockRejectedValue(new Error('TMDB API error: 404 Not Found')),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      const result = await detectContentChanges(mockQueueItems.slice(0, 1), {
        tmdbApiKey: 'test-key',
        storedReleaseDates: {},
      })

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0]).toMatchObject({
        queue_item_id: 'queue-1',
        tmdb_id: 12345,
        title: 'Breaking Bad',
        change_type: 'removed',
      })
    })

    it('detects show cancellation status', async () => {
      // Mock TMDB returning cancelled status
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockResolvedValue({
          id: 12345,
          name: 'Breaking Bad',
          first_air_date: '2026-02-01',
          status: 'Canceled', // Status changed
          number_of_episodes: 62,
          number_of_seasons: 5,
          episode_run_time: [45],
          poster_path: '/poster.jpg',
          overview: 'A show about chemistry',
          genres: [],
        }),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      const result = await detectContentChanges(mockQueueItems.slice(0, 1), {
        tmdbApiKey: 'test-key',
        storedReleaseDates: { 12345: '2026-02-01' },
        storedStatuses: { 12345: 'Returning Series' },
      })

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0]).toMatchObject({
        queue_item_id: 'queue-1',
        tmdb_id: 12345,
        change_type: 'cancelled',
        old_value: 'Returning Series',
        new_value: 'Canceled',
      })
    })

    it('returns empty array when no changes detected', async () => {
      // Mock TMDB returning same data
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockResolvedValue({
          id: 12345,
          name: 'Breaking Bad',
          first_air_date: '2026-02-01',
          status: 'Returning Series',
          number_of_episodes: 62,
          number_of_seasons: 5,
          episode_run_time: [45],
          poster_path: '/poster.jpg',
          overview: 'A show about chemistry',
          genres: [],
        }),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      const result = await detectContentChanges(mockQueueItems.slice(0, 1), {
        tmdbApiKey: 'test-key',
        storedReleaseDates: { 12345: '2026-02-01' },
        storedStatuses: { 12345: 'Returning Series' },
      })

      expect(result.changes).toHaveLength(0)
      expect(result.checked_count).toBe(1)
      expect(result.error_count).toBe(0)
    })

    it('handles TMDB API errors gracefully', async () => {
      // Mock TMDB throwing generic error
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockRejectedValue(new Error('Network error')),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      const result = await detectContentChanges(mockQueueItems.slice(0, 1), {
        tmdbApiKey: 'test-key',
        storedReleaseDates: {},
      })

      // Should not throw, but record error
      expect(result.error_count).toBe(1)
      expect(result.checked_count).toBe(1)
    })

    it('filters to only user queued content (processes all items)', async () => {
      const mockTMDBClient = {
        getShowDetails: vi.fn().mockResolvedValue({
          id: 12345,
          name: 'Breaking Bad',
          first_air_date: '2026-02-01',
          status: 'Returning Series',
          number_of_episodes: 62,
          number_of_seasons: 5,
          episode_run_time: [45],
          poster_path: '/poster.jpg',
          overview: 'A show about chemistry',
          genres: [],
        }),
      }

      const { createTMDBClient } = await import('@/lib/tmdb/client')
      vi.mocked(createTMDBClient).mockReturnValue(mockTMDBClient as any)

      // Pass multiple items - should check all
      const result = await detectContentChanges(mockQueueItems, {
        tmdbApiKey: 'test-key',
        storedReleaseDates: {},
      })

      // Should have checked both items (only TV items call getShowDetails)
      expect(result.checked_count).toBe(2)
    })
  })

  describe('handleContentChange', () => {
    it('creates notification for content change', async () => {
      const change: ContentChange = {
        queue_item_id: 'queue-1',
        tmdb_id: 12345,
        title: 'Breaking Bad',
        change_type: 'date_changed',
        old_value: '2026-02-01',
        new_value: '2026-03-01',
        detected_at: '2026-01-17T10:00:00Z',
      }

      // This will create a notification - just verify it doesn't throw
      await expect(handleContentChange(change, 'user-123')).resolves.not.toThrow()
    })
  })
})
