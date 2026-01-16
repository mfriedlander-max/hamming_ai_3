import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addToQueue,
  removeFromQueue,
  planBinge,
  watchTogether,
  setReminder,
  applyAllActions,
  regeneratePlan,
  reorderQueue,
} from './action-handlers'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Calendar Action Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('addToQueue', () => {
    it('calls queue API with release data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ item: { id: 'queue-1', title: 'Test Show' } }),
      })

      const release = {
        id: 'release-1',
        tmdb_id: 12345,
        title: 'Test Show',
        content_type: 'tv' as const,
        service_id: 'service-1',
        service_name: 'Netflix',
        duration_minutes: 300,
      }

      const result = await addToQueue(release)

      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_to_queue', release }),
      })
      expect((result as { item: { title: string } }).item.title).toBe('Test Show')
    })

    it('throws error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      })

      const release = {
        id: 'release-1',
        tmdb_id: 12345,
        title: 'Test Show',
        content_type: 'tv' as const,
        service_id: 'service-1',
        service_name: 'Netflix',
        duration_minutes: 300,
      }

      await expect(addToQueue(release)).rejects.toThrow('Server error')
    })
  })

  describe('removeFromQueue', () => {
    it('calls queue API with item id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await removeFromQueue('queue-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_from_queue', queue_item_id: 'queue-1' }),
      })
    })
  })

  describe('planBinge', () => {
    it('calls binge API with show data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          item: { id: 'queue-1' },
          binge_plan: { total_episodes: 10, days_to_complete: 5 },
        }),
      })

      const show = {
        tmdb_id: 12345,
        title: 'Breaking Bad',
        service_id: 'service-1',
        service_name: 'Netflix',
      }

      const result = await planBinge(show)

      expect(mockFetch).toHaveBeenCalledWith('/api/queue/binge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(show),
      })
      expect(result.binge_plan.total_episodes).toBe(10)
    })
  })

  describe('watchTogether', () => {
    it('calls watch-together API with friends', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          session: { id: 'session-1', participant_ids: ['friend-1', 'friend-2'] },
        }),
      })

      const result = await watchTogether('queue-1', ['friend-1', 'friend-2'])

      expect(mockFetch).toHaveBeenCalledWith('/api/queue/watch-together', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_item_id: 'queue-1', friend_ids: ['friend-1', 'friend-2'] }),
      })
      expect(result.session.participant_ids).toHaveLength(2)
    })
  })

  describe('setReminder', () => {
    it('calls calendar actions API for reminder', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reminder: { id: 'reminder-1' } }),
      })

      const result = await setReminder('2026-01-20', 'service-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_reminder', release_date: '2026-01-20', service_id: 'service-1' }),
      })
      expect(result.reminder.id).toBe('reminder-1')
    })
  })

  describe('applyAllActions', () => {
    it('calls calendar actions API for apply_all', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ actions_applied: 3 }),
      })

      const result = await applyAllActions()

      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply_all' }),
      })
      expect(result.actions_applied).toBe(3)
    })
  })

  describe('regeneratePlan', () => {
    it('calls calendar actions API for regenerate', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Plan invalidated' }),
      })

      const result = await regeneratePlan()

      expect(mockFetch).toHaveBeenCalledWith('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      })
      expect(result.message).toContain('invalidated')
    })
  })

  describe('reorderQueue', () => {
    it('calls queue API to update priorities', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const newOrder = [
        { id: 'queue-2', priority: 1 },
        { id: 'queue-1', priority: 2 },
        { id: 'queue-3', priority: 3 },
      ]

      await reorderQueue(newOrder)

      expect(mockFetch).toHaveBeenCalledWith('/api/queue/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newOrder }),
      })
    })
  })
})
