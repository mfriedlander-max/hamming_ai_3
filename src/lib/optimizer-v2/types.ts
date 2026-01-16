/**
 * Optimizer v2 Types
 *
 * Unified watch intent system that pulls from all data sources:
 * - Taste matches (TMDB content matching user preferences)
 * - Watchlists (explicit user selections)
 * - Friend shares (content recommended by friends)
 * - Binge plans (scheduled series watching)
 * - Favorites (favorite shows from taste profile)
 */

// === INPUT TYPES ===

export type WatchIntentSource =
  | 'taste_match'
  | 'watchlist'
  | 'friend_share'
  | 'binge_plan'
  | 'favorite'

export interface WatchIntent {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  source: WatchIntentSource
  source_details?: {
    friend_id?: string
    friend_name?: string
    watchlist_id?: string
    watchlist_name?: string
    binge_plan_id?: string
  }
  service_id: string
  service_name: string
  release_date: string | null
  poster_path: string | null
  runtime_minutes: number // For movies
  episode_count?: number // For TV
  taste_match_score: number // 0-100
  priority_score: number // Calculated score
  deadline?: string // ISO date YYYY-MM-DD
  deadline_reason?: string
}

export interface UserSubscription {
  id: string
  service_id: string
  service_name: string
  monthly_cost: number
  status: 'active' | 'paused'
  cancel_url?: string | null
}

export interface TasteProfile {
  genres: string[]
  favorite_shows: string[]
}

export interface WatchTimeSettings {
  watch_speed: number // Episodes per day (1-6)
  hours_per_week: number // Available hours (default: 10)
}

// === OUTPUT TYPES ===

export interface WatchSlot {
  intent_id: string
  date: string // ISO date YYYY-MM-DD
  duration_minutes: number
}

export interface SubscriptionWindow {
  service_id: string
  service_name: string
  subscribe_date: string // ISO date YYYY-MM-DD
  cancel_date: string // ISO date YYYY-MM-DD
  monthly_cost: number
  reason: string
}

export type ActionType = 'subscribe' | 'cancel' | 'pause' | 'resume' | 'set_reminder'

export interface ThisWeekAction {
  type: ActionType
  service_id: string
  service_name: string
  date: string // ISO date YYYY-MM-DD
  reason: string
  reminder_id?: string
}

export interface Savings {
  current_yearly: number
  optimized_yearly: number
  savings_yearly: number
  savings_percent: number
}

export interface OptimizedPlan {
  generated_at: string // ISO timestamp
  inputs_hash: string // Hash of inputs for cache invalidation
  watch_intents: WatchIntent[]
  watch_schedule: WatchSlot[]
  subscription_windows: SubscriptionWindow[]
  this_week_actions: ThisWeekAction[]
  savings: Savings
  conflicts?: ConflictInfo[]
}

// === CONFLICT TYPES (for Claude AI) ===

export type ConflictType =
  | 'competing_deadlines'
  | 'overloaded_schedule'
  | 'service_overlap'

export interface ConflictInfo {
  type: ConflictType
  description: string
  affected_intents: string[] // intent IDs
  suggested_resolution?: string
  claude_reasoning?: string
}

// === API TYPES ===

export interface OptimizeRequest {
  force_refresh?: boolean
}

export interface OptimizeResponse {
  plan: OptimizedPlan
  from_cache: boolean
}

export interface ApplyPlanRequest {
  plan: OptimizedPlan
  actions_to_apply?: string[] // Specific action IDs, or all if empty
}

export interface ApplyPlanResponse {
  reminders_created: number
  subscriptions_updated: number
  actions_applied: ThisWeekAction[]
}

// === INTERNAL TYPES ===

export interface OptimizerInputs {
  subscriptions: UserSubscription[]
  taste_profile: TasteProfile
  watch_time: WatchTimeSettings
  watchlist_items: WatchlistItemInput[]
  friend_shares: FriendShareInput[]
  binge_plans: BingePlanInput[]
  content_releases: ContentReleaseInput[]
}

export interface WatchlistItemInput {
  tmdb_id: number
  content_type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  added_by_friend?: { id: string; name: string }
}

export interface FriendShareInput {
  tmdb_id: number
  content_type: 'movie' | 'tv'
  title: string
  friend_id: string
  friend_name: string
  shared_at: string
}

export interface BingePlanInput {
  show_id: number
  show_title: string
  service_id: string
  service_name: string
  total_episodes: number
  subscribe_date: string
  cancel_date: string
  poster_url: string | null
}

export interface ContentReleaseInput {
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  release_date: string
  genres: string[]
  service_ids: string[]
  poster_path: string | null
  runtime_minutes?: number
  episode_count?: number
}

// === PRIORITY SCORING CONSTANTS ===

export const PRIORITY_WEIGHTS = {
  DEADLINE_URGENT: 50, // ≤7 days
  DEADLINE_SOON: 30, // ≤14 days
  FRIEND_SHARE: 40,
  TASTE_MATCH_MAX: 30, // Scaled by match %
  WATCHLIST: 10,
  BINGE_PLAN: 10,
  RELEASE_RECENT: 20, // ≤7 days old
} as const

// === CALENDAR-UNIFIED TYPES ===
// Extended types for the unified calendar page

export interface CalendarSavings {
  current_annual_cost: number
  optimized_annual_cost: number
  annual_savings: number
  savings_percentage: number
}

export interface CalendarAction {
  id: string
  action_type: ActionType
  service_id: string
  service_name: string
  scheduled_date: string
  reason: string
}

export interface CalendarWatchSlot {
  intent_id: string
  title: string
  service_id: string
  service_name: string
  scheduled_date: string
  duration_minutes: number
  priority_score: number
  source: WatchIntentSource
  deadline?: string
}

export interface CalendarSubscriptionWindow {
  service_id: string
  service_name: string
  start_date: string
  end_date: string
  monthly_cost: number
  is_currently_subscribed: boolean
  reason: string
}

export interface CalendarOptimizedPlan {
  savings: CalendarSavings
  watch_queue: CalendarWatchSlot[]
  subscription_windows: CalendarSubscriptionWindow[]
  this_week_actions: CalendarAction[]
}

export interface ContentRelease {
  id: string
  title: string
  release_date: string
  service_id: string
  service_name: string
  type: 'movie' | 'series'
  taste_match_score: number
  overview?: string
  genres?: string[]
  runtime?: number
  season_count?: number
  poster_path?: string
  friend_watching?: boolean
}

// Helper to convert OptimizedPlan to CalendarOptimizedPlan
export function toCalendarPlan(plan: OptimizedPlan, subscriptions: UserSubscription[]): CalendarOptimizedPlan {
  const subscriptionMap = new Map(subscriptions.map(s => [s.service_id, s]))

  return {
    savings: {
      current_annual_cost: plan.savings.current_yearly,
      optimized_annual_cost: plan.savings.optimized_yearly,
      annual_savings: plan.savings.savings_yearly,
      savings_percentage: plan.savings.savings_percent,
    },
    watch_queue: plan.watch_intents.map(intent => ({
      intent_id: intent.id,
      title: intent.title,
      service_id: intent.service_id,
      service_name: intent.service_name,
      scheduled_date: plan.watch_schedule.find(s => s.intent_id === intent.id)?.date || intent.release_date || '',
      duration_minutes: intent.runtime_minutes || (intent.episode_count || 1) * 45,
      priority_score: intent.priority_score,
      source: intent.source,
      deadline: intent.deadline,
    })),
    subscription_windows: plan.subscription_windows.map(window => ({
      service_id: window.service_id,
      service_name: window.service_name,
      start_date: window.subscribe_date,
      end_date: window.cancel_date,
      monthly_cost: window.monthly_cost,
      is_currently_subscribed: subscriptionMap.get(window.service_id)?.status === 'active',
      reason: window.reason,
    })),
    this_week_actions: plan.this_week_actions.map((action, index) => ({
      id: `action-${index}`,
      action_type: action.type,
      service_id: action.service_id,
      service_name: action.service_name,
      scheduled_date: action.date,
      reason: action.reason,
    })),
  }
}
