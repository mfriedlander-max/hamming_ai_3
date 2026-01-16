import { createClient } from '@/lib/supabase/server'
import type { UserBehaviorPattern } from './types'

const DEFAULT_PATTERN: Omit<UserBehaviorPattern, 'id' | 'user_id'> = {
  avg_watch_hours_per_week: 10,
  preferred_action_time: '09:00',
  missed_deadline_count: 0,
  auto_actions_accepted: 0,
  auto_actions_rejected: 0,
  timezone: 'America/New_York',
  last_activity_date: new Date().toISOString().split('T')[0],
  updated_at: new Date().toISOString(),
}

/**
 * Get a user's behavior pattern, creating a default if none exists
 */
export async function getUserBehaviorPattern(
  userId: string
): Promise<UserBehaviorPattern> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_behavior_patterns')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Create default pattern
    const newPattern = {
      user_id: userId,
      ...DEFAULT_PATTERN,
    }

    const { data: created, error: createError } = await supabase
      .from('user_behavior_patterns')
      .insert(newPattern)
      .select()
      .single()

    if (createError || !created) {
      // Return in-memory default if DB fails
      return {
        id: 'temp-' + userId,
        user_id: userId,
        ...DEFAULT_PATTERN,
      }
    }

    return created as UserBehaviorPattern
  }

  return data as UserBehaviorPattern
}

/**
 * Update a user's behavior pattern
 *
 * For increment fields (missed_deadline_count, auto_actions_accepted, etc.),
 * the value passed is added to the current value
 */
export async function updateBehaviorPattern(
  userId: string,
  updates: Partial<UserBehaviorPattern>
): Promise<void> {
  const supabase = await createClient()

  // Get current pattern
  const current = await getUserBehaviorPattern(userId)

  // Build update object, incrementing count fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.missed_deadline_count !== undefined) {
    updateData.missed_deadline_count =
      current.missed_deadline_count + updates.missed_deadline_count
  }

  if (updates.auto_actions_accepted !== undefined) {
    updateData.auto_actions_accepted =
      current.auto_actions_accepted + updates.auto_actions_accepted
  }

  if (updates.auto_actions_rejected !== undefined) {
    updateData.auto_actions_rejected =
      current.auto_actions_rejected + updates.auto_actions_rejected
  }

  if (updates.avg_watch_hours_per_week !== undefined) {
    updateData.avg_watch_hours_per_week = updates.avg_watch_hours_per_week
  }

  if (updates.preferred_action_time !== undefined) {
    updateData.preferred_action_time = updates.preferred_action_time
  }

  if (updates.timezone !== undefined) {
    updateData.timezone = updates.timezone
  }

  if (updates.last_activity_date !== undefined) {
    updateData.last_activity_date = updates.last_activity_date
  }

  await supabase
    .from('user_behavior_patterns')
    .update(updateData)
    .eq('user_id', userId)
}

/**
 * Record a user's response to an auto-action
 */
export async function recordAutoActionResponse(
  userId: string,
  accepted: boolean
): Promise<void> {
  await updateBehaviorPattern(userId, {
    [accepted ? 'auto_actions_accepted' : 'auto_actions_rejected']: 1,
  })
}

/**
 * Infer optimal action time based on user behavior
 *
 * Currently returns preferred_action_time or default.
 * In the future, could analyze activity patterns.
 */
export function inferOptimalActionTime(pattern: UserBehaviorPattern): string {
  // Default to stored preference or 09:00
  return pattern.preferred_action_time || '09:00'
}
