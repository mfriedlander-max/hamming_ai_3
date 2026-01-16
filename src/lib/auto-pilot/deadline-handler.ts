import { createClient } from '@/lib/supabase/server'
import type { MissedDeadline, UpcomingDeadline, DeadlineCheckResult } from './types'
import { createAutoPilotNotification, sendAutoPilotNotification } from './notification-sender'
import { updateBehaviorPattern } from './behavior-tracker'

/**
 * Handle a missed deadline
 *
 * 1. Send notification explaining the miss
 * 2. Update behavior pattern (increment missed_deadline_count)
 * 3. Trigger plan regeneration (invalidate cache)
 */
export async function handleMissedDeadline(
  missed: MissedDeadline,
  userId: string
): Promise<void> {
  // 1. Send notification
  const notification = createAutoPilotNotification('deadline_missed', {
    intent_id: missed.intent_id,
    deadline: missed.original_deadline,
    title: missed.intent_title,
    missed_by_days: missed.missed_by_days,
    suggested_new_deadline: missed.suggested_new_deadline,
  })
  await sendAutoPilotNotification(userId, notification)

  // 2. Update behavior pattern
  await updateBehaviorPattern(userId, {
    missed_deadline_count: 1, // Will be incremented by the function
  })

  // 3. Invalidate optimizer cache to trigger regeneration
  const supabase = await createClient()
  await supabase.from('optimizer_plans').delete().eq('user_id', userId)
}

/**
 * Handle an upcoming deadline
 *
 * Only notifies if urgent (≤3 days)
 */
export async function handleUpcomingDeadline(
  upcoming: UpcomingDeadline,
  userId: string
): Promise<void> {
  // Only notify for urgent deadlines
  if (!upcoming.is_urgent) {
    return
  }

  const notification = createAutoPilotNotification('deadline_warning', {
    intent_id: upcoming.intent_id,
    deadline: upcoming.deadline,
    title: upcoming.intent_title,
    days_until: upcoming.days_until,
  })
  await sendAutoPilotNotification(userId, notification)
}

/**
 * Handle all deadlines from a check result
 *
 * Processes all missed deadlines, then all urgent upcoming ones
 */
export async function handleAllDeadlines(
  result: DeadlineCheckResult,
  userId: string
): Promise<{ handled: number; notifications_sent: number }> {
  let handled = 0
  let notifications_sent = 0

  // Handle all missed deadlines
  for (const missed of result.missed_deadlines) {
    await handleMissedDeadline(missed, userId)
    handled++
    notifications_sent++
  }

  // Handle urgent upcoming deadlines
  for (const upcoming of result.upcoming_deadlines) {
    if (upcoming.is_urgent) {
      await handleUpcomingDeadline(upcoming, userId)
      handled++
      notifications_sent++
    }
  }

  return { handled, notifications_sent }
}
