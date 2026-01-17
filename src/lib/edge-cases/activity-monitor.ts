/**
 * Activity Monitor
 *
 * Tracks user activity to improve auto-pilot behavior:
 * - Login tracking
 * - Queue interactions
 * - Item completions
 * - Inactive user detection
 */

import { createClient } from '@/lib/supabase/server'
import type { ActivitySummary } from './types'

const DEFAULT_INACTIVE_THRESHOLD_DAYS = 7

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / oneDay)
}

/**
 * Get the most recent date from two nullable date strings
 */
function getMostRecentActivity(login: string | null, interaction: string | null): Date | null {
  if (!login && !interaction) return null
  if (!login) return new Date(interaction!)
  if (!interaction) return new Date(login)
  return new Date(login) > new Date(interaction) ? new Date(login) : new Date(interaction)
}

/**
 * Record a login event for a user
 */
export async function recordLogin(userId: string): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  await supabase.from('user_behavior_patterns').upsert(
    {
      user_id: userId,
      last_login_date: now,
    },
    { onConflict: 'user_id' }
  )
}

/**
 * Record a queue interaction for a user
 */
export async function recordQueueInteraction(userId: string): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  await supabase.from('user_behavior_patterns').upsert(
    {
      user_id: userId,
      last_queue_interaction: now,
    },
    { onConflict: 'user_id' }
  )
}

/**
 * Record an item completion for a user
 */
export async function recordItemCompletion(userId: string): Promise<void> {
  const supabase = await createClient()

  // First, get current count
  const { data } = await supabase
    .from('user_behavior_patterns')
    .select('items_completed_count')
    .eq('user_id', userId)
    .single()

  const currentCount = data?.items_completed_count ?? 0

  // Update with incremented count
  await supabase
    .from('user_behavior_patterns')
    .update({ items_completed_count: currentCount + 1 })
    .eq('user_id', userId)
}

/**
 * Get activity summary for a user
 */
export async function getActivitySummary(userId: string): Promise<ActivitySummary> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_behavior_patterns')
    .select('*')
    .eq('user_id', userId)
    .single()

  const now = new Date()
  const lastActivity = getMostRecentActivity(
    data?.last_login_date ?? null,
    data?.last_queue_interaction ?? null
  )
  const daysSinceActivity = lastActivity ? daysBetween(lastActivity, now) : 999
  const isInactive = daysSinceActivity > DEFAULT_INACTIVE_THRESHOLD_DAYS

  return {
    user_id: userId,
    last_login: data?.last_login_date ?? null,
    last_queue_interaction: data?.last_queue_interaction ?? null,
    items_completed: data?.items_completed_count ?? 0,
    is_inactive: isInactive,
    days_since_activity: daysSinceActivity,
  }
}

/**
 * Check if a user is inactive (no activity for specified days)
 */
export async function isUserInactive(
  userId: string,
  thresholdDays: number = DEFAULT_INACTIVE_THRESHOLD_DAYS
): Promise<boolean> {
  const summary = await getActivitySummary(userId)
  return summary.days_since_activity > thresholdDays
}
