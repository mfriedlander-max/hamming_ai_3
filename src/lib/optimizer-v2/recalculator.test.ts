import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shouldRecalculate,
  hashOptimizerInputs,
  isPlanExpired,
} from './recalculator'
import type { OptimizerInputs, OptimizedPlan } from './types'

describe('recalculator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
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
      genres: ['Action'],
      favorite_shows: [],
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

  const createMinimalPlan = (hash: string, generatedAt: string): OptimizedPlan => ({
    generated_at: generatedAt,
    inputs_hash: hash,
    watch_intents: [],
    watch_schedule: [],
    subscription_windows: [],
    this_week_actions: [],
    savings: {
      current_yearly: 0,
      optimized_yearly: 0,
      savings_yearly: 0,
      savings_percent: 0,
    },
  })

  describe('hashOptimizerInputs', () => {
    it('returns same hash for same inputs', () => {
      const inputs = createMinimalInputs()
      const hash1 = hashOptimizerInputs(inputs)
      const hash2 = hashOptimizerInputs(inputs)

      expect(hash1).toBe(hash2)
    })

    it('returns different hash when inputs change', () => {
      const inputs1 = createMinimalInputs()
      const inputs2 = createMinimalInputs()
      inputs2.watchlist_items = [
        { tmdb_id: 123, content_type: 'movie', title: 'Test', poster_path: null },
      ]

      const hash1 = hashOptimizerInputs(inputs1)
      const hash2 = hashOptimizerInputs(inputs2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('isPlanExpired', () => {
    it('returns true when plan is older than 1 hour', () => {
      const oldPlan = createMinimalPlan('hash', '2026-01-15T10:00:00Z')
      expect(isPlanExpired(oldPlan)).toBe(true)
    })

    it('returns false when plan is recent', () => {
      const recentPlan = createMinimalPlan('hash', '2026-01-15T11:30:00Z')
      expect(isPlanExpired(recentPlan)).toBe(false)
    })
  })

  describe('shouldRecalculate', () => {
    it('returns true when inputs hash differs', () => {
      const inputs = createMinimalInputs()
      const plan = createMinimalPlan('different-hash', '2026-01-15T11:30:00Z')

      expect(shouldRecalculate(inputs, plan)).toBe(true)
    })

    it('returns true when plan is expired', () => {
      const inputs = createMinimalInputs()
      const hash = hashOptimizerInputs(inputs)
      const plan = createMinimalPlan(hash, '2026-01-15T10:00:00Z')

      expect(shouldRecalculate(inputs, plan)).toBe(true)
    })

    it('returns false when hash matches and plan is fresh', () => {
      const inputs = createMinimalInputs()
      const hash = hashOptimizerInputs(inputs)
      const plan = createMinimalPlan(hash, '2026-01-15T11:30:00Z')

      expect(shouldRecalculate(inputs, plan)).toBe(false)
    })

    it('returns true when no existing plan', () => {
      const inputs = createMinimalInputs()
      expect(shouldRecalculate(inputs, null)).toBe(true)
    })
  })
})
