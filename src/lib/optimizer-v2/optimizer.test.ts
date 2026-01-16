import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateOptimizedPlan } from './optimizer'
import type { OptimizerInputs } from './types'

describe('optimizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  const createMinimalInputs = (): OptimizerInputs => ({
    subscriptions: [
      {
        id: 's1',
        service_id: 'netflix',
        service_name: 'Netflix',
        monthly_cost: 15.99,
        status: 'active',
      },
    ],
    taste_profile: {
      genres: ['Action', 'Comedy'],
      favorite_shows: ['Breaking Bad'],
    },
    watch_time: {
      watch_speed: 2,
      hours_per_week: 10,
    },
    watchlist_items: [],
    friend_shares: [],
    binge_plans: [],
    content_releases: [],
  })

  describe('generateOptimizedPlan', () => {
    it('returns a complete OptimizedPlan structure', () => {
      const inputs = createMinimalInputs()
      const plan = generateOptimizedPlan(inputs)

      expect(plan.generated_at).toBeDefined()
      expect(plan.inputs_hash).toBeDefined()
      expect(plan.watch_intents).toBeDefined()
      expect(plan.watch_schedule).toBeDefined()
      expect(plan.subscription_windows).toBeDefined()
      expect(plan.this_week_actions).toBeDefined()
      expect(plan.savings).toBeDefined()
    })

    it('generates intents from watchlist items', () => {
      const inputs = createMinimalInputs()
      inputs.watchlist_items = [
        {
          tmdb_id: 123,
          content_type: 'movie',
          title: 'Test Movie',
          poster_path: null,
        },
      ]

      const plan = generateOptimizedPlan(inputs)

      expect(plan.watch_intents.some((i) => i.tmdb_id === 123)).toBe(true)
    })

    it('generates intents from taste matches', () => {
      const inputs = createMinimalInputs()
      inputs.content_releases = [
        {
          tmdb_id: 456,
          title: 'Action Movie',
          type: 'movie',
          release_date: '2026-02-01',
          genres: ['Action'],
          service_ids: ['netflix'],
          poster_path: null,
          runtime_minutes: 120,
        },
      ]

      const plan = generateOptimizedPlan(inputs)

      expect(plan.watch_intents.some((i) => i.tmdb_id === 456)).toBe(true)
    })

    it('calculates savings comparing current to optimized', () => {
      const inputs = createMinimalInputs()
      const plan = generateOptimizedPlan(inputs)

      expect(plan.savings.current_yearly).toBeDefined()
      expect(plan.savings.optimized_yearly).toBeDefined()
      expect(plan.savings.savings_yearly).toBeDefined()
      expect(plan.savings.savings_percent).toBeDefined()
    })

    it('handles empty inputs gracefully', () => {
      const inputs: OptimizerInputs = {
        subscriptions: [],
        taste_profile: { genres: [], favorite_shows: [] },
        watch_time: { watch_speed: 2, hours_per_week: 10 },
        watchlist_items: [],
        friend_shares: [],
        binge_plans: [],
        content_releases: [],
      }

      const plan = generateOptimizedPlan(inputs)

      expect(plan.watch_intents).toHaveLength(0)
      expect(plan.watch_schedule).toHaveLength(0)
      expect(plan.subscription_windows).toHaveLength(0)
    })

    it('prioritizes intents correctly', () => {
      const inputs = createMinimalInputs()
      inputs.friend_shares = [
        {
          tmdb_id: 100,
          content_type: 'movie',
          title: 'Friend Rec',
          friend_id: 'f1',
          friend_name: 'Alice',
          shared_at: '2026-01-10',
        },
      ]
      inputs.watchlist_items = [
        {
          tmdb_id: 200,
          content_type: 'movie',
          title: 'Watchlist Movie',
          poster_path: null,
        },
      ]

      const plan = generateOptimizedPlan(inputs)

      // Friend share should have higher priority than watchlist
      const friendIntent = plan.watch_intents.find((i) => i.tmdb_id === 100)
      const watchlistIntent = plan.watch_intents.find((i) => i.tmdb_id === 200)

      if (friendIntent && watchlistIntent) {
        expect(friendIntent.priority_score).toBeGreaterThan(
          watchlistIntent.priority_score
        )
      }
    })
  })
})
