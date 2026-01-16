import { describe, it, expect } from 'vitest'
import {
  buildWatchIntents,
  buildFromTasteMatches,
  buildFromWatchlist,
  buildFromFriendShares,
  buildFromBingePlans,
  buildFromFavorites,
} from './intent-builder'
import type {
  ContentReleaseInput,
  WatchlistItemInput,
  FriendShareInput,
  BingePlanInput,
  TasteProfile,
  UserSubscription,
} from './types'

describe('intent-builder', () => {
  const mockSubscriptions: UserSubscription[] = [
    {
      id: 's1',
      service_id: 'netflix',
      service_name: 'Netflix',
      monthly_cost: 15.99,
      status: 'active',
    },
    {
      id: 's2',
      service_id: 'hulu',
      service_name: 'Hulu',
      monthly_cost: 12.99,
      status: 'active',
    },
  ]

  const mockTasteProfile: TasteProfile = {
    genres: ['Action', 'Comedy'],
    favorite_shows: ['Breaking Bad', 'The Office'],
  }

  describe('buildFromTasteMatches', () => {
    it('creates intents from content releases matching user genres', () => {
      const releases: ContentReleaseInput[] = [
        {
          tmdb_id: 123,
          title: 'Action Movie',
          type: 'movie',
          release_date: '2026-02-01',
          genres: ['Action', 'Thriller'],
          service_ids: ['netflix'],
          poster_path: '/poster.jpg',
          runtime_minutes: 120,
        },
      ]

      const intents = buildFromTasteMatches(
        releases,
        mockTasteProfile,
        mockSubscriptions
      )

      expect(intents).toHaveLength(1)
      expect(intents[0].source).toBe('taste_match')
      expect(intents[0].tmdb_id).toBe(123)
      expect(intents[0].taste_match_score).toBeGreaterThan(0)
    })

    it('filters out content not on subscribed services', () => {
      const releases: ContentReleaseInput[] = [
        {
          tmdb_id: 456,
          title: 'Disney Movie',
          type: 'movie',
          release_date: '2026-02-01',
          genres: ['Action'],
          service_ids: ['disney'], // Not subscribed
          poster_path: null,
          runtime_minutes: 90,
        },
      ]

      const intents = buildFromTasteMatches(
        releases,
        mockTasteProfile,
        mockSubscriptions
      )
      expect(intents).toHaveLength(0)
    })

    it('calculates taste match score based on genre overlap', () => {
      const releases: ContentReleaseInput[] = [
        {
          tmdb_id: 789,
          title: 'Action Comedy',
          type: 'movie',
          release_date: '2026-02-01',
          genres: ['Action', 'Comedy'], // Both match
          service_ids: ['netflix'],
          poster_path: null,
          runtime_minutes: 100,
        },
      ]

      const intents = buildFromTasteMatches(
        releases,
        mockTasteProfile,
        mockSubscriptions
      )
      expect(intents[0].taste_match_score).toBe(40) // 20 per genre match
    })
  })

  describe('buildFromWatchlist', () => {
    it('creates intents from watchlist items', () => {
      const items: WatchlistItemInput[] = [
        {
          tmdb_id: 100,
          content_type: 'tv',
          title: 'Watchlist Show',
          poster_path: '/show.jpg',
        },
      ]

      const intents = buildFromWatchlist(items, mockSubscriptions)

      expect(intents).toHaveLength(1)
      expect(intents[0].source).toBe('watchlist')
      expect(intents[0].title).toBe('Watchlist Show')
    })

    it('includes friend info when item was added by friend', () => {
      const items: WatchlistItemInput[] = [
        {
          tmdb_id: 101,
          content_type: 'movie',
          title: 'Friend Rec',
          poster_path: null,
          added_by_friend: { id: 'f1', name: 'Alice' },
        },
      ]

      const intents = buildFromWatchlist(items, mockSubscriptions)

      expect(intents[0].source_details?.friend_id).toBe('f1')
      expect(intents[0].source_details?.friend_name).toBe('Alice')
    })
  })

  describe('buildFromFriendShares', () => {
    it('creates intents from friend shares', () => {
      const shares: FriendShareInput[] = [
        {
          tmdb_id: 200,
          content_type: 'tv',
          title: 'Friend Show',
          friend_id: 'f2',
          friend_name: 'Bob',
          shared_at: '2026-01-10',
        },
      ]

      const intents = buildFromFriendShares(shares, mockSubscriptions)

      expect(intents).toHaveLength(1)
      expect(intents[0].source).toBe('friend_share')
      expect(intents[0].source_details?.friend_name).toBe('Bob')
    })
  })

  describe('buildFromBingePlans', () => {
    it('creates intents with deadlines from binge plans', () => {
      const plans: BingePlanInput[] = [
        {
          show_id: 300,
          show_title: 'Binge Show',
          service_id: 'netflix',
          service_name: 'Netflix',
          total_episodes: 20,
          subscribe_date: '2026-01-15',
          cancel_date: '2026-02-15',
          poster_url: '/binge.jpg',
        },
      ]

      const intents = buildFromBingePlans(plans)

      expect(intents).toHaveLength(1)
      expect(intents[0].source).toBe('binge_plan')
      expect(intents[0].deadline).toBe('2026-02-15')
      expect(intents[0].deadline_reason).toContain('Binge plan')
    })
  })

  describe('buildFromFavorites', () => {
    it('creates intents from favorite shows in taste profile', () => {
      const releases: ContentReleaseInput[] = [
        {
          tmdb_id: 400,
          title: 'Breaking Bad Movie',
          type: 'movie',
          release_date: '2026-03-01',
          genres: ['Drama'],
          service_ids: ['netflix'],
          poster_path: null,
          runtime_minutes: 150,
        },
      ]

      const intents = buildFromFavorites(
        releases,
        mockTasteProfile,
        mockSubscriptions
      )

      expect(intents).toHaveLength(1)
      expect(intents[0].source).toBe('favorite')
      expect(intents[0].taste_match_score).toBe(100) // Favorite = max score
    })
  })

  describe('buildWatchIntents (orchestrator)', () => {
    it('combines all sources and deduplicates by tmdb_id', () => {
      const inputs = {
        subscriptions: mockSubscriptions,
        taste_profile: mockTasteProfile,
        watchlist_items: [
          {
            tmdb_id: 123,
            content_type: 'movie' as const,
            title: 'Dup Movie',
            poster_path: null,
          },
        ],
        friend_shares: [
          {
            tmdb_id: 123,
            content_type: 'movie' as const,
            title: 'Dup Movie',
            friend_id: 'f1',
            friend_name: 'Alice',
            shared_at: '2026-01-10',
          },
        ],
        binge_plans: [],
        content_releases: [
          {
            tmdb_id: 123,
            title: 'Dup Movie',
            type: 'movie' as const,
            release_date: '2026-02-01',
            genres: ['Action'],
            service_ids: ['netflix'],
            poster_path: null,
            runtime_minutes: 120,
          },
        ],
        watch_time: { watch_speed: 2, hours_per_week: 10 },
      }

      const intents = buildWatchIntents(inputs)

      // Should dedupe: highest priority source wins (friend_share > watchlist > taste_match)
      expect(intents.filter((i) => i.tmdb_id === 123)).toHaveLength(1)
      expect(intents.find((i) => i.tmdb_id === 123)?.source).toBe('friend_share')
    })

    it('returns empty array when no inputs', () => {
      const inputs = {
        subscriptions: [],
        taste_profile: { genres: [], favorite_shows: [] },
        watchlist_items: [],
        friend_shares: [],
        binge_plans: [],
        content_releases: [],
        watch_time: { watch_speed: 2, hours_per_week: 10 },
      }

      const intents = buildWatchIntents(inputs)
      expect(intents).toHaveLength(0)
    })

    it('preserves binge_plan over friend_share in deduplication', () => {
      const inputs = {
        subscriptions: mockSubscriptions,
        taste_profile: mockTasteProfile,
        watchlist_items: [],
        friend_shares: [
          {
            tmdb_id: 999,
            content_type: 'tv' as const,
            title: 'Same Show',
            friend_id: 'f1',
            friend_name: 'Alice',
            shared_at: '2026-01-10',
          },
        ],
        binge_plans: [
          {
            show_id: 999,
            show_title: 'Same Show',
            service_id: 'netflix',
            service_name: 'Netflix',
            total_episodes: 10,
            subscribe_date: '2026-01-15',
            cancel_date: '2026-02-15',
            poster_url: null,
          },
        ],
        content_releases: [],
        watch_time: { watch_speed: 2, hours_per_week: 10 },
      }

      const intents = buildWatchIntents(inputs)
      expect(intents.filter((i) => i.tmdb_id === 999)).toHaveLength(1)
      expect(intents.find((i) => i.tmdb_id === 999)?.source).toBe('binge_plan')
    })

    it('generates unique IDs for each intent', () => {
      const inputs = {
        subscriptions: mockSubscriptions,
        taste_profile: mockTasteProfile,
        watchlist_items: [
          { tmdb_id: 1, content_type: 'movie' as const, title: 'Movie 1', poster_path: null },
          { tmdb_id: 2, content_type: 'movie' as const, title: 'Movie 2', poster_path: null },
        ],
        friend_shares: [],
        binge_plans: [],
        content_releases: [],
        watch_time: { watch_speed: 2, hours_per_week: 10 },
      }

      const intents = buildWatchIntents(inputs)
      const ids = intents.map((i) => i.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
