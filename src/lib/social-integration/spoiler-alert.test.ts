/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkSpoilerRisks } from './spoiler-alert'

// Track which query we're on
let queryCount = 0
let queryResults: { data: any; error: any }[] = []

// Mock Supabase with proper chained method handling
const mockFrom = vi.fn().mockImplementation(() => {
  const result = queryResults[queryCount++] || { data: null, error: null }

  const chain: any = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)

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

describe('spoiler-alert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryCount = 0
    queryResults = []
  })

  describe('checkSpoilerRisks', () => {
    it('returns alert when friend is ahead on TV show', async () => {
      queryResults = [
        // Get user's friendships
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
        // Get user's watch progress (via activity_feed)
        {
          data: [
            {
              user_id: 'user-1',
              data: { tmdb_id: 123, episodes_watched: 3, title: 'Test Show' },
            },
          ],
          error: null,
        },
        // Get friend's watch progress
        {
          data: [
            {
              user_id: 'friend-1',
              data: { tmdb_id: 123, episodes_watched: 7, title: 'Test Show' },
            },
          ],
          error: null,
        },
      ]

      const result = await checkSpoilerRisks('user-1', [123])

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        tmdb_id: 123,
        friend_id: 'friend-1',
        friend_name: 'Alice',
        friend_position: 'ahead',
        episode_difference: 4,
      })
    })

    it('returns no alert when same episode', async () => {
      queryResults = [
        // Get user's friendships
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
        // Get user's watch progress
        {
          data: [
            {
              user_id: 'user-1',
              data: { tmdb_id: 123, episodes_watched: 5, title: 'Test Show' },
            },
          ],
          error: null,
        },
        // Get friend's watch progress - same episode
        {
          data: [
            {
              user_id: 'friend-1',
              data: { tmdb_id: 123, episodes_watched: 5, title: 'Test Show' },
            },
          ],
          error: null,
        },
      ]

      const result = await checkSpoilerRisks('user-1', [123])

      expect(result).toHaveLength(0)
    })

    it('returns multiple alerts for multiple friends', async () => {
      queryResults = [
        // Get user's friendships with 2 friends
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
        // Get user's watch progress
        {
          data: [
            {
              user_id: 'user-1',
              data: { tmdb_id: 123, episodes_watched: 3, title: 'Test Show' },
            },
          ],
          error: null,
        },
        // Get friends' watch progress - both ahead
        {
          data: [
            {
              user_id: 'friend-1',
              data: { tmdb_id: 123, episodes_watched: 8, title: 'Test Show' },
            },
            {
              user_id: 'friend-2',
              data: { tmdb_id: 123, episodes_watched: 5, title: 'Test Show' },
            },
          ],
          error: null,
        },
      ]

      const result = await checkSpoilerRisks('user-1', [123])

      expect(result).toHaveLength(2)
      expect(result.some((a) => a.friend_name === 'Alice')).toBe(true)
      expect(result.some((a) => a.friend_name === 'Bob')).toBe(true)
    })
  })
})
