// src/lib/auto-pilot/types.ts

/**
 * Auto-Pilot Types
 *
 * System that automatically executes optimizer plans:
 * - Auto-pause subscriptions when no upcoming content
 * - Auto-remind users of scheduled actions
 * - Handle missed deadlines gracefully
 * - Track user behavior patterns for optimization
 */

// Re-export types from optimizer-v2 for convenience
export type { ThisWeekAction, ActionType, OptimizedPlan } from '../optimizer-v2/types'

// === AUTO-ACTION TYPES ===

export type AutoActionStatus = 'pending' | 'executed' | 'failed' | 'skipped'

export interface AutoAction {
  id: string
  user_id: string
  action_type: string // ActionType from optimizer-v2
  service_id: string
  service_name: string
  scheduled_date: string // ISO date YYYY-MM-DD
  executed_at: string | null // ISO timestamp
  status: AutoActionStatus
  reason: string
  error_message?: string
  created_at: string
}

// === DEADLINE TYPES ===

export interface MissedDeadline {
  user_id: string
  intent_id: string
  intent_title: string
  original_deadline: string
  missed_by_days: number
  suggested_new_deadline: string
  reason: string
}

export interface DeadlineCheckResult {
  missed_deadlines: MissedDeadline[]
  upcoming_deadlines: UpcomingDeadline[]
}

export interface UpcomingDeadline {
  intent_id: string
  intent_title: string
  deadline: string
  days_until: number
  is_urgent: boolean // ≤3 days
}

// === BEHAVIOR PATTERN TYPES ===

export interface UserBehaviorPattern {
  id: string
  user_id: string
  avg_watch_hours_per_week: number
  preferred_action_time: string // HH:MM format (e.g., "09:00")
  missed_deadline_count: number
  auto_actions_accepted: number
  auto_actions_rejected: number
  timezone: string
  last_activity_date: string
  updated_at: string
}

// === EXECUTION TYPES ===

export interface ExecutionResult {
  actions_executed: number
  actions_skipped: number
  actions_failed: number
  notifications_sent: number
  errors: ExecutionError[]
}

export interface ExecutionError {
  action_id: string
  error_type: 'subscription_lookup' | 'subscription_update' | 'reminder_create' | 'notification_send' | 'unknown'
  message: string
}

// === NOTIFICATION TYPES ===

export type AutoPilotNotificationType =
  | 'action_executed'      // "We paused Netflix for you"
  | 'action_pending'       // "Tomorrow: Cancel Hulu"
  | 'deadline_missed'      // "Deadline passed - rescheduled"
  | 'deadline_warning'     // "3 days left to watch X"
  | 'plan_regenerated'     // "Your plan was updated"

export interface AutoPilotNotification {
  type: AutoPilotNotificationType
  title: string
  body: string
  data?: {
    action_id?: string
    service_id?: string
    deadline?: string
    intent_id?: string
  }
}

// === API TYPES ===

export interface ExecuteCronRequest {
  dry_run?: boolean // If true, don't actually execute, just return what would happen
}

export interface ExecuteCronResponse {
  result: ExecutionResult
  next_execution: string // ISO timestamp
}

export interface ApplyPlanRequest {
  plan_id?: string // If not provided, fetches cached plan
  actions_to_apply?: string[] // Specific action IDs, or all if empty
}

export interface ApplyPlanResponse {
  reminders_created: number
  subscriptions_updated: number
  auto_actions_created: number
  actions_applied: AutoAction[]
}

// === CRON CONFIGURATION ===

export interface CronConfig {
  schedule: string // Cron expression (e.g., "0 9 * * *")
  timezone_aware: boolean
  batch_size: number // Users to process per batch
}

export const DEFAULT_CRON_CONFIG: CronConfig = {
  schedule: '0 9 * * *', // Daily at 9 AM
  timezone_aware: true,
  batch_size: 100,
}
