// Types for Phase 6 (Reminders)

import type { SubscriptionStatus } from '@/components/subscriptions/StatusBadge'

export type ReminderType = 'cancel' | 'resubscribe'

export interface Reminder {
  id: string
  user_id: string
  subscription_id: string
  type: ReminderType
  trigger_date: string // ISO date string (YYYY-MM-DD)
  triggered: boolean
  created_at: string
}

export interface ReminderWithSubscription extends Reminder {
  subscription: {
    id: string
    service_name: string
    status: SubscriptionStatus
  }
}

export interface CreateReminderInput {
  subscription_id: string
  type: ReminderType
  trigger_date: string // ISO date string (YYYY-MM-DD)
}
