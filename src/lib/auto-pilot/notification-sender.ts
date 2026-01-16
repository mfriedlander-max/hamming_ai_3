import { createClient } from '@/lib/supabase/server'
import type { AutoPilotNotification, AutoPilotNotificationType } from './types'

/**
 * Create an auto-pilot notification with appropriate title and body
 */
export function createAutoPilotNotification(
  type: AutoPilotNotificationType,
  data: Record<string, unknown>
): AutoPilotNotification {
  const title = data.title as string | undefined
  const serviceName = data.service_name as string | undefined

  switch (type) {
    case 'action_executed':
      return {
        type,
        title: `Auto-Pilot: ${serviceName || 'Subscription'} updated`,
        body: `We automatically updated your ${serviceName || 'subscription'} for you.`,
        data: {
          action_id: data.action_id as string | undefined,
          service_id: data.service_id as string | undefined,
        },
      }

    case 'action_pending':
      return {
        type,
        title: `Tomorrow: ${serviceName || 'Subscription'} action`,
        body: `Reminder: ${data.reason as string || 'Action scheduled for tomorrow'}`,
        data: {
          action_id: data.action_id as string | undefined,
          service_id: data.service_id as string | undefined,
        },
      }

    case 'deadline_missed':
      return {
        type,
        title: `Deadline passed for "${title || 'content'}"`,
        body: `The deadline was ${data.missed_by_days || 0} day(s) ago. We've suggested a new date: ${data.suggested_new_deadline || 'TBD'}`,
        data: {
          intent_id: data.intent_id as string | undefined,
          deadline: data.deadline as string | undefined,
        },
      }

    case 'deadline_warning':
      return {
        type,
        title: `${data.days_until || 0} day(s) left to watch "${title || 'content'}"`,
        body: `Your deadline for "${title || 'content'}" is coming up on ${data.deadline || 'soon'}.`,
        data: {
          intent_id: data.intent_id as string | undefined,
          deadline: data.deadline as string | undefined,
        },
      }

    case 'plan_regenerated':
      return {
        type,
        title: 'Your plan was updated',
        body: 'Your subscription plan has been recalculated based on recent changes.',
        data: {},
      }

    default:
      return {
        type,
        title: 'Auto-Pilot Update',
        body: 'Something happened with your subscriptions.',
        data: {},
      }
  }
}

/**
 * Send an auto-pilot notification to a user
 *
 * Checks user preferences and inserts into notifications table
 */
export async function sendAutoPilotNotification(
  userId: string,
  notification: AutoPilotNotification
): Promise<boolean> {
  const supabase = await createClient()

  // Check if user has auto-pilot notifications enabled
  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single()

  // Default to enabled if no preferences set
  const prefs = profile?.notification_preferences as Record<string, boolean> | null
  const autoPilotEnabled = prefs?.auto_pilot !== false

  if (!autoPilotEnabled) {
    return false
  }

  // Insert notification
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: notification.type,
    title: notification.title,
    message: notification.body,
    data: notification.data,
    read: false,
  })

  return !error
}
