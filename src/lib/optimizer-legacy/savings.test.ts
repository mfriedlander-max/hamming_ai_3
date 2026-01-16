import { describe, it, expect } from 'vitest'
import {
  calculateCurrentAnnualCost,
  calculateOptimizedAnnualCost,
  calculateSavings,
} from './savings'
import type { SubscriptionForOptimizer, MonthPlan } from './types'

describe('savings', () => {
  describe('calculateCurrentAnnualCost', () => {
    it('calculates annual cost from monthly subscriptions', () => {
      const subscriptions: SubscriptionForOptimizer[] = [
        { id: '1', service_id: 's1', service_name: 'Netflix', monthly_cost: 15.99, status: 'active' },
        { id: '2', service_id: 's2', service_name: 'Hulu', monthly_cost: 12.99, status: 'active' },
      ]

      const result = calculateCurrentAnnualCost(subscriptions)

      // (15.99 + 12.99) * 12 = 347.76
      expect(result).toBeCloseTo(347.76, 2)
    })

    it('only includes active subscriptions', () => {
      const subscriptions: SubscriptionForOptimizer[] = [
        { id: '1', service_id: 's1', service_name: 'Netflix', monthly_cost: 15.99, status: 'active' },
        { id: '2', service_id: 's2', service_name: 'Hulu', monthly_cost: 12.99, status: 'paused' },
      ]

      const result = calculateCurrentAnnualCost(subscriptions)

      // Only Netflix: 15.99 * 12 = 191.88
      expect(result).toBeCloseTo(191.88, 2)
    })

    it('returns 0 for empty subscriptions', () => {
      const result = calculateCurrentAnnualCost([])
      expect(result).toBe(0)
    })

    it('returns 0 when all subscriptions are paused', () => {
      const subscriptions: SubscriptionForOptimizer[] = [
        { id: '1', service_id: 's1', service_name: 'Netflix', monthly_cost: 15.99, status: 'paused' },
      ]

      const result = calculateCurrentAnnualCost(subscriptions)
      expect(result).toBe(0)
    })
  })

  describe('calculateOptimizedAnnualCost', () => {
    it('sums monthly costs from all months', () => {
      const months: MonthPlan[] = [
        { month: '2026-01', actions: [], active_services: ['s1'], monthly_cost: 15.99 },
        { month: '2026-02', actions: [], active_services: ['s1'], monthly_cost: 15.99 },
        { month: '2026-03', actions: [], active_services: ['s1', 's2'], monthly_cost: 28.98 },
      ]

      const result = calculateOptimizedAnnualCost(months)

      // 15.99 + 15.99 + 28.98 = 60.96
      expect(result).toBeCloseTo(60.96, 2)
    })

    it('returns 0 for empty months', () => {
      const result = calculateOptimizedAnnualCost([])
      expect(result).toBe(0)
    })

    it('handles months with zero cost', () => {
      const months: MonthPlan[] = [
        { month: '2026-01', actions: [], active_services: [], monthly_cost: 0 },
        { month: '2026-02', actions: [], active_services: ['s1'], monthly_cost: 15.99 },
      ]

      const result = calculateOptimizedAnnualCost(months)
      expect(result).toBeCloseTo(15.99, 2)
    })
  })

  describe('calculateSavings', () => {
    it('calculates difference between current and optimized cost', () => {
      const result = calculateSavings(500, 350)
      expect(result).toBe(150)
    })

    it('returns 0 when costs are equal', () => {
      const result = calculateSavings(500, 500)
      expect(result).toBe(0)
    })

    it('returns negative when optimized cost is higher', () => {
      const result = calculateSavings(300, 350)
      expect(result).toBe(-50)
    })

    it('handles decimal values correctly', () => {
      const result = calculateSavings(347.76, 191.88)
      expect(result).toBeCloseTo(155.88, 2)
    })
  })
})
