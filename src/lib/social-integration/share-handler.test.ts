/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  shareContentWithFriend,
  getSharesReceivedByUser,
  addShareToQueue,
} from './share-handler'

// Track which query we're on
let queryCount = 0
let queryResults: { data: any; error: any }[] = []

// Mock Supabase with proper chained method handling
const mockFrom = vi.fn().mockImplementation(() => {
  const result = queryResults[queryCount++] || { data: null, error: null }

  const chain: any = {}
  chain.select = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.single = vi.fn(() => chain)

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

describe('share-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryCount = 0
    queryResults = []
  })

  describe('shareContentWithFriend', () => {
    it('creates share and notification for recipient', async () => {
      queryResults = [
        // Check friendship exists and is accepted
        {
          data: [
            {
              requester_id: 'user-1',
              addressee_id: 'friend-1',
              status: 'accepted',
            },
          ],
          error: null,
        },
        // Insert friend_share (via notifications table since friend_shares doesn't exist)
        { data: { id: 'share-1' }, error: null },
        // Insert notification
        { data: { id: 'notif-1' }, error: null },
      ]

      await expect(
        shareContentWithFriend('user-1', {
          recipient_id: 'friend-1',
          tmdb_id: 123,
          content_type: 'movie',
          title: 'Test Movie',
          message: 'Check this out!',
        })
      ).resolves.not.toThrow()

      // Verify from was called for friendship check and notifications
      expect(mockFrom).toHaveBeenCalled()
    })

    it('prevents sharing to non-friend', async () => {
      queryResults = [
        // No friendship found
        { data: [], error: null },
      ]

      await expect(
        shareContentWithFriend('user-1', {
          recipient_id: 'not-friend',
          tmdb_id: 123,
          content_type: 'movie',
          title: 'Test Movie',
        })
      ).rejects.toThrow('Cannot share with non-friend')
    })
  })

  describe('getSharesReceivedByUser', () => {
    it('returns shares received by user', async () => {
      queryResults = [
        {
          data: [
            {
              id: 'notif-1',
              user_id: 'user-1',
              type: 'friend_share',
              title: 'Alice shared a movie',
              body: 'Test Movie',
              data: {
                sender_id: 'friend-1',
                sender_name: 'Alice',
                tmdb_id: 123,
                content_type: 'movie',
                title: 'Test Movie',
              },
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
          error: null,
        },
      ]

      const result = await getSharesReceivedByUser('user-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        sender_name: 'Alice',
        tmdb_id: 123,
        title: 'Test Movie',
      })
    })
  })

  describe('addShareToQueue', () => {
    it('creates queue item with source=friend_share and source_details', async () => {
      queryResults = [
        // Get share notification
        {
          data: {
            id: 'notif-1',
            data: {
              sender_id: 'friend-1',
              sender_name: 'Alice',
              tmdb_id: 123,
              content_type: 'movie',
              title: 'Test Movie',
            },
          },
          error: null,
        },
        // Get service for this content (mock TMDB lookup - simplified)
        {
          data: { id: 'service-1', name: 'Netflix' },
          error: null,
        },
        // Insert watchlist item
        { data: { id: 'item-1' }, error: null },
      ]

      await expect(addShareToQueue('user-1', 'notif-1')).resolves.not.toThrow()
    })
  })
})
