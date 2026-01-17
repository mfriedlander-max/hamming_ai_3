/**
 * Price Monitor
 *
 * Detects price changes for subscribed services by comparing
 * user's stored price with the current service default price.
 */

import { createClient } from '@/lib/supabase/server'
import type { PriceChange, PriceMonitorResult, SubscriptionWithService } from './types'

const SIGNIFICANT_CHANGE_THRESHOLD = 10 // 10% change is significant

/**
 * Calculate percentage change between two prices
 */
export function calculatePercentChange(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0
  return ((newPrice - oldPrice) / oldPrice) * 100
}

/**
 * Check for price changes in user's subscriptions
 */
export async function checkPriceChanges(
  subscriptions: SubscriptionWithService[]
): Promise<PriceMonitorResult> {
  const changes: PriceChange[] = []
  const now = new Date().toISOString()

  for (const sub of subscriptions) {
    const oldPrice = sub.monthly_price
    const newPrice = sub.service.default_price

    // Skip if prices are the same
    if (oldPrice === newPrice) continue

    const changePercent = calculatePercentChange(oldPrice, newPrice)
    const changeDirection = newPrice > oldPrice ? 'increase' : 'decrease'

    changes.push({
      service_id: sub.service_id,
      service_name: sub.service.name,
      old_price: oldPrice,
      new_price: newPrice,
      change_percent: Math.abs(changePercent),
      change_direction: changeDirection,
      detected_at: now,
    })
  }

  // Identify significant changes (>10%)
  const significantChanges = changes.filter(
    (c) => c.change_percent > SIGNIFICANT_CHANGE_THRESHOLD
  )

  return {
    changes,
    significant_changes: significantChanges,
  }
}

/**
 * Record a price change in the history table
 */
export async function recordPriceChange(change: PriceChange): Promise<void> {
  const supabase = await createClient()

  await supabase.from('service_price_history').insert({
    service_id: change.service_id,
    old_price: change.old_price,
    new_price: change.new_price,
    detected_at: change.detected_at,
  })
}
