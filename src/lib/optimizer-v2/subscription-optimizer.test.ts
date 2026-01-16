import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  optimizeSubscriptions,
  calculateSubscriptionWindows,
  calculateSavings,
} from './subscription-optimizer'
import type {
  WatchSlot,
  UserSubscription,
  SubscriptionWindow,
} from './types'

describe('subscription-optimizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

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
    {
      id: 's3',
      service_id: 'disney',
      service_name: 'Disney+',
      monthly_cost: 10.99,
      status: 'paused',
    },
  ]

  describe('calculateSubscriptionWindows', () => {
    it('creates windows for services with scheduled content', () => {
      const schedule: WatchSlot[] = [
        { intent_id: 'i1', date: '2026-01-20', duration_minutes: 120 },
        { intent_id: 'i2', date: '2026-02-15', duration_minutes: 120 },
      ]
      const intentServiceMap = new Map([
        ['i1', 'netflix'],
        ['i2', 'netflix'],
      ])

      const windows = calculateSubscriptionWindows(
        schedule,
        intentServiceMap,
        mockSubscriptions
      )

      expect(windows).toHaveLength(1)
      expect(windows[0].service_id).toBe('netflix')
    })

    it('creates separate windows for gaps > 30 days', () => {
      const schedule: WatchSlot[] = [
        { intent_id: 'i1', date: '2026-01-20', duration_minutes: 120 },
        { intent_id: 'i2', date: '2026-03-15', duration_minutes: 120 }, // 54 days later
      ]
      const intentServiceMap = new Map([
        ['i1', 'netflix'],
        ['i2', 'netflix'],
      ])

      const windows = calculateSubscriptionWindows(
        schedule,
        intentServiceMap,
        mockSubscriptions
      )

      expect(windows).toHaveLength(2)
    })

    it('includes buffer days before first watch and after last', () => {
      const schedule: WatchSlot[] = [
        { intent_id: 'i1', date: '2026-02-01', duration_minutes: 120 },
      ]
      const intentServiceMap = new Map([['i1', 'hulu']])

      const windows = calculateSubscriptionWindows(
        schedule,
        intentServiceMap,
        mockSubscriptions
      )

      // Should subscribe a few days before
      expect(new Date(windows[0].subscribe_date) < new Date('2026-02-01')).toBe(
        true
      )
      // Should cancel after (with buffer)
      expect(new Date(windows[0].cancel_date) > new Date('2026-02-01')).toBe(
        true
      )
    })
  })

  describe('calculateSavings', () => {
    it('calculates yearly savings from windows vs current', () => {
      const windows: SubscriptionWindow[] = [
        {
          service_id: 'netflix',
          service_name: 'Netflix',
          subscribe_date: '2026-01-01',
          cancel_date: '2026-03-01',
          monthly_cost: 15.99,
          reason: 'test',
        },
        {
          service_id: 'netflix',
          service_name: 'Netflix',
          subscribe_date: '2026-06-01',
          cancel_date: '2026-08-01',
          monthly_cost: 15.99,
          reason: 'test',
        },
      ]

      const savings = calculateSavings(windows, mockSubscriptions)

      // Current: (15.99 + 12.99) * 12 = 347.76/year (paused doesn't count)
      expect(savings.current_yearly).toBeCloseTo(347.76, 1)
      // Optimized: 15.99 * 4 months = 63.96
      expect(savings.optimized_yearly).toBeLessThan(savings.current_yearly)
      expect(savings.savings_yearly).toBeGreaterThan(0)
    })

    it('handles empty windows (cancel everything)', () => {
      const savings = calculateSavings([], mockSubscriptions)

      expect(savings.optimized_yearly).toBe(0)
      expect(savings.savings_percent).toBe(100)
    })

    it('calculates correct percentage', () => {
      const windows: SubscriptionWindow[] = [
        {
          service_id: 'netflix',
          service_name: 'Netflix',
          subscribe_date: '2026-01-01',
          cancel_date: '2026-07-01',
          monthly_cost: 15.99,
          reason: 'test',
        },
      ]

      const savings = calculateSavings(windows, mockSubscriptions)

      expect(savings.savings_percent).toBeGreaterThan(0)
      expect(savings.savings_percent).toBeLessThan(100)
    })
  })

  describe('optimizeSubscriptions', () => {
    it('returns complete optimization result', () => {
      const schedule: WatchSlot[] = [
        { intent_id: 'i1', date: '2026-02-01', duration_minutes: 120 },
      ]
      const intentServiceMap = new Map([['i1', 'netflix']])

      const result = optimizeSubscriptions(
        schedule,
        intentServiceMap,
        mockSubscriptions
      )

      expect(result.windows).toBeDefined()
      expect(result.savings).toBeDefined()
      expect(result.savings.current_yearly).toBeGreaterThan(0)
    })

    it('handles empty schedule', () => {
      const result = optimizeSubscriptions([], new Map(), mockSubscriptions)

      expect(result.windows).toHaveLength(0)
      expect(result.savings.optimized_yearly).toBe(0)
    })
  })
})
