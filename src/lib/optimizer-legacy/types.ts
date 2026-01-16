/**
 * Types for the Subscription Optimizer
 *
 * The optimizer uses Claude to generate a 12-month subscribe/cancel schedule
 * that maximizes content access while minimizing annual cost.
 */

/**
 * A single action to take on a subscription
 */
export interface ServiceAction {
  service_id: string
  service_name: string
  action: 'subscribe' | 'cancel' | 'keep'
  date: string // ISO date string YYYY-MM-DD
  reason: string // Explanation from Claude
}

/**
 * Plan for a single month
 */
export interface MonthPlan {
  month: string // Format: "YYYY-MM"
  actions: ServiceAction[]
  active_services: string[] // service_ids that should be active this month
  monthly_cost: number
}

/**
 * Complete optimized schedule for 12 months
 */
export interface OptimizedSchedule {
  current_annual_cost: number
  optimized_annual_cost: number
  savings: number
  months: MonthPlan[]
}

/**
 * Subscription data needed for optimization
 */
export interface SubscriptionForOptimizer {
  id: string
  service_id: string
  service_name: string
  monthly_cost: number
  status: 'active' | 'paused'
}

/**
 * Content release data needed for optimization
 */
export interface ContentForOptimizer {
  service_id: string
  service_name: string
  releases: {
    title: string
    release_date: string
    genres: string[]
    type: 'movie' | 'tv'
  }[]
}

/**
 * Taste profile data needed for optimization
 */
export interface TasteProfileForOptimizer {
  genres: string[]
  favorite_shows: string[]
}

/**
 * Aggregated data passed to the optimizer prompt
 */
export interface OptimizerInput {
  subscriptions: SubscriptionForOptimizer[]
  taste_profile: TasteProfileForOptimizer
  content_by_month: {
    month: string
    services: ContentForOptimizer[]
  }[]
  start_month: string // Format: "YYYY-MM"
}

/**
 * Result of applying an optimized schedule
 */
export interface ApplyScheduleResult {
  reminders_created: number
  subscriptions_updated: number
}
