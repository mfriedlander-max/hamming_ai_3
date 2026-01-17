/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFriendsActivity,
  getFriendsWatchingContent,
  enrichReleasesWithFriendActivity,
} from './friend-activity'

// Track which query we're on
let queryCount = 0
let queryResults: { data: any; error: any }[] = []

// Mock Supabase with proper chained method handling
const mockFrom = vi.fn().mockImplementation(() => {
  const result = queryResults[queryCount++] || { data: null, error: null }

  // Create a chain that resolves to the current result
  const chain: any = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)

  // Make it thenable
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

describe('friend-activity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryCount = 0
    queryResults = []
  })

  describe('getFriendsActivity', () => {
    it('returns empty array when user has no friends', async () => {
      queryResults = [{ data: [], error: null }]

      const result = await getFriendsActivity('user-1')

      expect(result).toEqual([])
    })

    it('returns friend activity items for accepted friendships', async () => {
      queryResults = [
        // First query: friendships
        {
          data: [
            {
              requester_id: 'user-1',
              addressee_id: 'friend-1',
              status: 'accepted',
              addressee: { id: 'friend-1', name: 'Alice' },
            },
            {
              requester_id: 'friend-2',
              addressee_id: 'user-1',
              status: 'accepted',
              requester: { id: 'friend-2', name: 'Bob' },
            },
          ],
          error: null,
        },
        // Second query: watchlist items
        {
          data: [
            {
              added_by: 'friend-1',
              tmdb_id: 123,
              content_type: 'movie',
              profiles: { name: 'Alice' },
            },
            {
              added_by: 'friend-2',
              tmdb_id: 456,
              content_type: 'tv',
              profiles: { name: 'Bob' },
            },
          ],
          error: null,
        },
      ]

      const result = await getFriendsActivity('user-1')

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        friend_id: 'friend-1',
        friend_name: 'Alice',
        tmdb_id: 123,
        content_type: 'movie',
      })
    })
  })

  describe('getFriendsWatchingContent', () => {
    it('returns empty map when no friends watching specified content', async () => {
      queryResults = [{ data: [], error: null }]

      const result = await getFriendsWatchingContent('user-1', [123, 456])

      expect(result).toEqual({})
    })

    it('returns friend IDs watching specified content', async () => {
      queryResults = [
        // Friendships
        {
          data: [
            {
              requester_id: 'user-1',
              addressee_id: 'friend-1',
              status: 'accepted',
              addressee: { id: 'friend-1', name: 'Alice' },
            },
          ],
          error: null,
        },
        // Watchlist items
        {
          data: [
            {
              added_by: 'friend-1',
              tmdb_id: 123,
              profiles: { name: 'Alice' },
            },
          ],
          error: null,
        },
      ]

      const result = await getFriendsWatchingContent('user-1', [123, 456])

      expect(result[123]).toBeDefined()
      expect(result[123].friend_ids).toContain('friend-1')
      expect(result[123].friend_names).toContain('Alice')
      expect(result[456]).toBeUndefined()
    })

    it('handles multiple friends watching same content', async () => {
      queryResults = [
        // Friendships with 2 friends
        {
          data: [
            {
              requester_id: 'user-1',
              addressee_id: 'friend-1',
              status: 'accepted',
              addressee: { id: 'friend-1', name: 'Alice' },
            },
            {
              requester_id: 'friend-2',
              addressee_id: 'user-1',
              status: 'accepted',
              requester: { id: 'friend-2', name: 'Bob' },
            },
          ],
          error: null,
        },
        // Both friends watching same content
        {
          data: [
            { added_by: 'friend-1', tmdb_id: 123, profiles: { name: 'Alice' } },
            { added_by: 'friend-2', tmdb_id: 123, profiles: { name: 'Bob' } },
          ],
          error: null,
        },
      ]

      const result = await getFriendsWatchingContent('user-1', [123])

      expect(result[123].friend_ids).toHaveLength(2)
      expect(result[123].friend_names).toContain('Alice')
      expect(result[123].friend_names).toContain('Bob')
    })
  })

  describe('enrichReleasesWithFriendActivity', () => {
    it('sets friend_watching correctly on releases', async () => {
      const releases = [
        { id: '1', title: 'Movie A', tmdb_id: 123 },
        { id: '2', title: 'Movie B', tmdb_id: 456 },
      ] as any[]

      queryResults = [
        // Friendships
        {
          data: [
            {
              requester_id: 'user-1',
              addressee_id: 'friend-1',
              status: 'accepted',
              addressee: { id: 'friend-1', name: 'Alice' },
            },
          ],
          error: null,
        },
        // Friend watching only movie 123
        {
          data: [
            { added_by: 'friend-1', tmdb_id: 123, profiles: { name: 'Alice' } },
          ],
          error: null,
        },
      ]

      const result = await enrichReleasesWithFriendActivity(releases, 'user-1')

      expect(result[0].friend_watching).toBe(true)
      expect(result[1].friend_watching).toBe(false)
    })
  })
})
