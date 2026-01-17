/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkPriceChanges,
  recordPriceChange,
  calculatePercentChange,
} from './price-monitor'
import type { SubscriptionWithService, PriceChange } from './types'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('price-monitor', () => {
  const mockSubscriptions: SubscriptionWithService[] = [
    {
      id: 'sub-1',
      user_id: 'user-123',
      service_id: 'service-1',
      monthly_price: 15.99,
      service: {
        id: 'service-1',
        name: 'Netflix',
        default_price: 15.99,
      },
    },
    {
      id: 'sub-2',
      user_id: 'user-123',
      service_id: 'service-2',
      monthly_price: 14.99,
      service: {
        id: 'service-2',
        name: 'Hulu',
        default_price: 14.99,
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkPriceChanges', () => {
    it('detects price increase for subscribed service', async () => {
      // User is paying $15.99, but service default is now $17.99
      const subscriptionsWithIncrease: SubscriptionWithService[] = [
        {
          ...mockSubscriptions[0],
          monthly_price: 15.99,
          service: {
            ...mockSubscriptions[0].service,
            default_price: 17.99, // Price increased
          },
        },
      ]

      const result = await checkPriceChanges(subscriptionsWithIncrease)

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0]).toMatchObject({
        service_id: 'service-1',
        service_name: 'Netflix',
        old_price: 15.99,
        new_price: 17.99,
        change_direction: 'increase',
      })
      expect(result.changes[0].change_percent).toBeCloseTo(12.5, 1)
    })

    it('detects price decrease for subscribed service', async () => {
      // User is paying $15.99, but service default is now $12.99
      const subscriptionsWithDecrease: SubscriptionWithService[] = [
        {
          ...mockSubscriptions[0],
          monthly_price: 15.99,
          service: {
            ...mockSubscriptions[0].service,
            default_price: 12.99, // Price decreased
          },
        },
      ]

      const result = await checkPriceChanges(subscriptionsWithDecrease)

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0]).toMatchObject({
        service_id: 'service-1',
        service_name: 'Netflix',
        old_price: 15.99,
        new_price: 12.99,
        change_direction: 'decrease',
      })
    })

    it('returns empty when prices unchanged', async () => {
      // Prices match - no change
      const result = await checkPriceChanges(mockSubscriptions)

      expect(result.changes).toHaveLength(0)
      expect(result.significant_changes).toHaveLength(0)
    })

    it('identifies significant changes (>10%)', async () => {
      // 20% price increase - should be significant
      const subscriptionsWithBigIncrease: SubscriptionWithService[] = [
        {
          ...mockSubscriptions[0],
          monthly_price: 10.00,
          service: {
            ...mockSubscriptions[0].service,
            default_price: 12.00, // 20% increase
          },
        },
      ]

      const result = await checkPriceChanges(subscriptionsWithBigIncrease)

      expect(result.changes).toHaveLength(1)
      expect(result.significant_changes).toHaveLength(1)
      expect(result.significant_changes[0].change_percent).toBeGreaterThan(10)
    })
  })

  describe('calculatePercentChange', () => {
    it('calculates percentage change correctly', () => {
      // $10 to $12 = 20% increase
      expect(calculatePercentChange(10, 12)).toBeCloseTo(20, 1)

      // $20 to $15 = 25% decrease
      expect(calculatePercentChange(20, 15)).toBeCloseTo(-25, 1)

      // $10 to $10 = 0% change
      expect(calculatePercentChange(10, 10)).toBe(0)
    })
  })

  describe('recordPriceChange', () => {
    it('records price change in history table', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const change: PriceChange = {
        service_id: 'service-1',
        service_name: 'Netflix',
        old_price: 15.99,
        new_price: 17.99,
        change_percent: 12.5,
        change_direction: 'increase',
        detected_at: '2026-01-17T10:00:00Z',
      }

      await expect(recordPriceChange(change)).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('service_price_history')
    })
  })
})
