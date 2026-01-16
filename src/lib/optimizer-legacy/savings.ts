import type { SubscriptionForOptimizer, MonthPlan } from './types'

/**
 * Calculate the current annual cost based on active subscriptions.
 * Assumes all active subscriptions are paid for 12 months.
 */
export function calculateCurrentAnnualCost(
  subscriptions: SubscriptionForOptimizer[]
): number {
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active')
  const monthlyTotal = activeSubscriptions.reduce(
    (sum, s) => sum + s.monthly_cost,
    0
  )
  return monthlyTotal * 12
}

/**
 * Calculate the optimized annual cost by summing monthly costs from the schedule.
 */
export function calculateOptimizedAnnualCost(months: MonthPlan[]): number {
  return months.reduce((sum, m) => sum + m.monthly_cost, 0)
}

/**
 * Calculate savings between current and optimized costs.
 * Positive value means savings, negative means the optimized plan costs more.
 */
export function calculateSavings(
  currentCost: number,
  optimizedCost: number
): number {
  return currentCost - optimizedCost
}
