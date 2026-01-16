import type {
  WatchSlot,
  UserSubscription,
  SubscriptionWindow,
  Savings,
} from './types'

const BUFFER_DAYS_BEFORE = 3 // Subscribe 3 days before first watch
const BUFFER_DAYS_AFTER = 7 // Keep subscription 7 days after last watch
const GAP_THRESHOLD_DAYS = 30 // Split into separate windows if gap > 30 days

export interface SubscriptionOptimizationResult {
  windows: SubscriptionWindow[]
  savings: Savings
}

/**
 * Add days to a date string, returning new date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate days between two date strings
 */
function daysBetween(dateStr1: string, dateStr2: string): number {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Calculate months between two date strings (partial months count as full)
 */
function monthsBetween(startDate: string, endDate: string): number {
  const days = daysBetween(startDate, endDate)
  return Math.ceil(days / 30)
}

/**
 * Calculate subscription windows from scheduled content
 */
export function calculateSubscriptionWindows(
  schedule: WatchSlot[],
  intentServiceMap: Map<string, string>,
  subscriptions: UserSubscription[]
): SubscriptionWindow[] {
  // Group slots by service
  const slotsByService = new Map<string, WatchSlot[]>()

  for (const slot of schedule) {
    const serviceId = intentServiceMap.get(slot.intent_id)
    if (!serviceId) continue

    if (!slotsByService.has(serviceId)) {
      slotsByService.set(serviceId, [])
    }
    slotsByService.get(serviceId)!.push(slot)
  }

  const windows: SubscriptionWindow[] = []

  // Create windows for each service
  for (const [serviceId, slots] of slotsByService) {
    const subscription = subscriptions.find((s) => s.service_id === serviceId)
    if (!subscription) continue

    // Sort slots by date
    const sortedSlots = [...slots].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Split into windows based on gaps
    let windowStart = sortedSlots[0].date
    let windowEnd = sortedSlots[0].date

    for (let i = 1; i < sortedSlots.length; i++) {
      const gap = daysBetween(windowEnd, sortedSlots[i].date)

      if (gap > GAP_THRESHOLD_DAYS) {
        // Create window for previous group
        windows.push({
          service_id: serviceId,
          service_name: subscription.service_name,
          subscribe_date: addDays(windowStart, -BUFFER_DAYS_BEFORE),
          cancel_date: addDays(windowEnd, BUFFER_DAYS_AFTER),
          monthly_cost: subscription.monthly_cost,
          reason: `Watch scheduled content on ${subscription.service_name}`,
        })

        // Start new window
        windowStart = sortedSlots[i].date
      }

      windowEnd = sortedSlots[i].date
    }

    // Create final window
    windows.push({
      service_id: serviceId,
      service_name: subscription.service_name,
      subscribe_date: addDays(windowStart, -BUFFER_DAYS_BEFORE),
      cancel_date: addDays(windowEnd, BUFFER_DAYS_AFTER),
      monthly_cost: subscription.monthly_cost,
      reason: `Watch scheduled content on ${subscription.service_name}`,
    })
  }

  return windows
}

/**
 * Calculate yearly savings comparing current vs optimized subscriptions
 */
export function calculateSavings(
  windows: SubscriptionWindow[],
  currentSubscriptions: UserSubscription[]
): Savings {
  // Calculate current yearly cost (only active subscriptions)
  const activeSubscriptions = currentSubscriptions.filter(
    (s) => s.status === 'active'
  )
  const current_yearly = activeSubscriptions.reduce(
    (sum, sub) => sum + sub.monthly_cost * 12,
    0
  )

  // Handle empty windows
  if (current_yearly === 0) {
    return {
      current_yearly: 0,
      optimized_yearly: 0,
      savings_yearly: 0,
      savings_percent: 0,
    }
  }

  // Calculate optimized yearly cost from windows
  let optimized_yearly = 0
  for (const window of windows) {
    const months = monthsBetween(window.subscribe_date, window.cancel_date)
    optimized_yearly += window.monthly_cost * months
  }

  const savings_yearly = current_yearly - optimized_yearly
  const savings_percent =
    current_yearly > 0
      ? Math.round((savings_yearly / current_yearly) * 100)
      : 0

  return {
    current_yearly: Math.round(current_yearly * 100) / 100,
    optimized_yearly: Math.round(optimized_yearly * 100) / 100,
    savings_yearly: Math.round(savings_yearly * 100) / 100,
    savings_percent,
  }
}

/**
 * Main function: optimize subscriptions based on schedule
 */
export function optimizeSubscriptions(
  schedule: WatchSlot[],
  intentServiceMap: Map<string, string>,
  subscriptions: UserSubscription[]
): SubscriptionOptimizationResult {
  const windows = calculateSubscriptionWindows(
    schedule,
    intentServiceMap,
    subscriptions
  )
  const savings = calculateSavings(windows, subscriptions)

  return { windows, savings }
}
