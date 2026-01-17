/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createWatchTogetherSession,
  getSessionsForUser,
} from './watch-together'

// Track which query we're on
let queryCount = 0
let queryResults: { data: any; error: any }[] = []

// Mock Supabase with proper chained method handling
const mockFrom = vi.fn().mockImplementation(() => {
  const result = queryResults[queryCount++] || { data: null, error: null }

  const chain: any = {}
  chain.select = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)
  chain.contains = vi.fn(() => chain)

  chain.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject)
  chain.catch = (reject: any) => chain.then(undefined, reject)

  return chain
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}))

describe('watch-together', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryCount = 0
    queryResults = []
  })

  describe('createWatchTogetherSession', () => {
    it('creates session with pending status', async () => {
      queryResults = [
        // Check friendships - all participants are friends
        {
          data: [
            { requester_id: 'user-1', addressee_id: 'friend-1', status: 'accepted' },
            { requester_id: 'user-1', addressee_id: 'friend-2', status: 'accepted' },
          ],
          error: null,
        },
        // Get organizer profile
        { data: { id: 'user-1', name: 'John' }, error: null },
        // Get participant profiles
        {
          data: [
            { id: 'friend-1', name: 'Alice' },
            { id: 'friend-2', name: 'Bob' },
          ],
          error: null,
        },
        // Insert session
        {
          data: {
            id: 'session-1',
            queue_item_id: 'queue-1',
            organizer_id: 'user-1',
            participant_ids: ['friend-1', 'friend-2'],
            status: 'pending',
          },
          error: null,
        },
        // Insert notifications for participants
        { data: null, error: null },
      ]

      const result = await createWatchTogetherSession(
        {
          queue_item_id: 'queue-1',
          friend_ids: ['friend-1', 'friend-2'],
          scheduled_date: '2025-02-01',
          message: 'Let\'s watch together!',
        },
        'user-1'
      )

      expect(result.status).toBe('pending')
      expect(result.organizer_id).toBe('user-1')
    })

    it('validates all participants are friends', async () => {
      queryResults = [
        // Only one friendship found (friend-2 is not a friend)
        {
          data: [
            { requester_id: 'user-1', addressee_id: 'friend-1', status: 'accepted' },
          ],
          error: null,
        },
      ]

      await expect(
        createWatchTogetherSession(
          {
            queue_item_id: 'queue-1',
            friend_ids: ['friend-1', 'friend-2'],
          },
          'user-1'
        )
      ).rejects.toThrow('Not all participants are friends')
    })

    it('sends notifications to participants', async () => {
      queryResults = [
        // Friendships
        {
          data: [
            { requester_id: 'user-1', addressee_id: 'friend-1', status: 'accepted' },
          ],
          error: null,
        },
        // Organizer profile
        { data: { id: 'user-1', name: 'John' }, error: null },
        // Participant profiles
        { data: [{ id: 'friend-1', name: 'Alice' }], error: null },
        // Insert session
        {
          data: {
            id: 'session-1',
            queue_item_id: 'queue-1',
            organizer_id: 'user-1',
            participant_ids: ['friend-1'],
            status: 'pending',
          },
          error: null,
        },
        // Insert notifications
        { data: null, error: null },
      ]

      await createWatchTogetherSession(
        { queue_item_id: 'queue-1', friend_ids: ['friend-1'] },
        'user-1'
      )

      // Verify notifications table was accessed
      expect(mockFrom).toHaveBeenCalledWith('notifications')
    })
  })

  describe('getSessionsForUser', () => {
    it('returns sessions for user as organizer or participant', async () => {
      // The function queries notifications table and extracts session data from data field
      queryResults = [
        {
          data: [
            {
              id: 'notif-1',
              data: {
                id: 'session-1',
                queue_item_id: 'queue-1',
                organizer_id: 'user-1',
                organizer_name: 'John',
                participant_ids: ['friend-1'],
                participant_names: ['Alice'],
                scheduled_date: '2025-02-01',
                status: 'pending',
                created_at: '2025-01-15T00:00:00Z',
              },
              created_at: '2025-01-15T00:00:00Z',
            },
            {
              id: 'notif-2',
              data: {
                id: 'session-2',
                queue_item_id: 'queue-2',
                organizer_id: 'friend-2',
                organizer_name: 'Bob',
                participant_ids: ['user-1', 'friend-3'],
                participant_names: ['John', 'Carol'],
                scheduled_date: null,
                status: 'confirmed',
                created_at: '2025-01-14T00:00:00Z',
              },
              created_at: '2025-01-14T00:00:00Z',
            },
          ],
          error: null,
        },
        // Get profiles for names
        {
          data: [
            { id: 'user-1', name: 'John' },
            { id: 'friend-1', name: 'Alice' },
            { id: 'friend-2', name: 'Bob' },
            { id: 'friend-3', name: 'Carol' },
          ],
          error: null,
        },
      ]

      const result = await getSessionsForUser('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('session-1')
      expect(result[1].id).toBe('session-2')
    })
  })
})
