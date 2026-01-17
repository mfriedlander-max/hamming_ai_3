/**
 * Edge Case Handling Types
 *
 * Types for monitoring content changes, price changes, user activity,
 * vacation mode, and queue health.
 */

import type { QueueItem } from '@/lib/queue/types'

// Content monitoring types
export type ContentChangeType = 'date_changed' | 'removed' | 'cancelled'

export interface ContentChange {
  queue_item_id: string
  tmdb_id: number
  title: string
  change_type: ContentChangeType
  old_value?: string
  new_value?: string
  detected_at: string
}

export interface ContentMonitorResult {
  changes: ContentChange[]
  checked_count: number
  error_count: number
}

// Price monitoring types
export type PriceChangeDirection = 'increase' | 'decrease'

export interface PriceChange {
  service_id: string
  service_name: string
  old_price: number
  new_price: number
  change_percent: number
  change_direction: PriceChangeDirection
  detected_at: string
}

export interface PriceMonitorResult {
  changes: PriceChange[]
  significant_changes: PriceChange[] // >10% change
}

// Activity monitoring types
export interface ActivitySummary {
  user_id: string
  last_login: string | null
  last_queue_interaction: string | null
  items_completed: number
  is_inactive: boolean
  days_since_activity: number
}

// Vacation mode types
export interface VacationStatus {
  is_on_vacation: boolean
  start_date: string | null
  return_date: string | null
  days_remaining: number | null
}

// Queue health types
export type QueueHealthStatus = 'healthy' | 'overloaded' | 'warning'

export interface QueueHealth {
  status: QueueHealthStatus
  total_hours_needed: number
  available_hours: number
  hours_deficit: number
  items_to_remove?: QueueItem[]
  deadline_conflicts?: string[]
}

// Edge case check result (combined)
export interface EdgeCaseCheckResult {
  content_changes: ContentChange[]
  price_changes: PriceChange[]
  activity_summary: ActivitySummary
  vacation_status: VacationStatus
  queue_health: QueueHealth
  notifications_created: number
  checked_at: string
}

// Subscription with service info (for price monitoring)
export interface SubscriptionWithService {
  id: string
  user_id: string
  service_id: string
  monthly_price: number
  service: {
    id: string
    name: string
    default_price: number
  }
}
