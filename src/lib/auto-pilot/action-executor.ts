import { createClient } from '@/lib/supabase/server'
import type { ThisWeekAction } from '../optimizer-v2/types'
import type { AutoAction, ExecutionResult, ExecutionError } from './types'
import { randomUUID } from 'crypto'

/**
 * Execute a single auto-pilot action
 *
 * Actions:
 * - set_reminder: Create a reminder in the reminders table
 * - pause: Update subscription status to 'paused'
 * - resume: Update subscription status to 'active'
 * - cancel: Create cancel reminder (user must click cancel_url)
 * - subscribe: Create resubscribe reminder
 */
export async function executeAction(
  action: ThisWeekAction,
  userId: string
): Promise<{ success: boolean; autoAction: AutoAction | null; error?: ExecutionError }> {
  const supabase = await createClient()

  // Generate action ID for tracking
  const actionId = randomUUID()
  const now = new Date().toISOString()

  try {
    switch (action.type) {
      case 'set_reminder':
      case 'cancel':
      case 'subscribe': {
        // Create reminder in reminders table
        const reminderType =
          action.type === 'cancel'
            ? 'cancel'
            : action.type === 'subscribe'
              ? 'resubscribe'
              : 'custom'

        const { error: reminderError } = await supabase.from('reminders').insert({
          user_id: userId,
          subscription_id: action.service_id,
          reminder_type: reminderType,
          reminder_date: action.date,
          message: action.reason,
        })

        if (reminderError) {
          return {
            success: false,
            autoAction: null,
            error: {
              action_id: actionId,
              error_type: 'reminder_create',
              message: reminderError.message,
            },
          }
        }
        break
      }

      case 'pause':
      case 'resume': {
        // Update subscription status
        const newStatus = action.type === 'pause' ? 'paused' : 'active'
        const newBoardColumn = action.type === 'pause' ? 'paused' : 'active'

        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: newStatus,
            board_column: newBoardColumn,
          })
          .eq('id', action.service_id)
          .eq('user_id', userId)

        if (subError) {
          return {
            success: false,
            autoAction: null,
            error: {
              action_id: actionId,
              error_type: 'subscription_update',
              message: subError.message,
            },
          }
        }
        break
      }

      default:
        return {
          success: false,
          autoAction: null,
          error: {
            action_id: actionId,
            error_type: 'unknown',
            message: `Unknown action type: ${action.type}`,
          },
        }
    }

    // Record successful action in auto_actions table
    const autoAction: AutoAction = {
      id: actionId,
      user_id: userId,
      action_type: action.type,
      service_id: action.service_id,
      service_name: action.service_name,
      scheduled_date: action.date,
      executed_at: now,
      status: 'executed',
      reason: action.reason,
      created_at: now,
    }

    // Store in database (don't fail if this fails)
    await supabase.from('auto_actions').insert({
      id: autoAction.id,
      user_id: autoAction.user_id,
      action_type: autoAction.action_type,
      service_id: autoAction.service_id,
      scheduled_date: autoAction.scheduled_date,
      executed_at: autoAction.executed_at,
      status: autoAction.status,
      reason: autoAction.reason,
    })

    return { success: true, autoAction }
  } catch (err) {
    return {
      success: false,
      autoAction: null,
      error: {
        action_id: actionId,
        error_type: 'unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    }
  }
}

/**
 * Execute multiple actions and return summary
 * Continues processing even if individual actions fail
 */
export async function executeActions(
  actions: ThisWeekAction[],
  userId: string
): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    actions_executed: 0,
    actions_skipped: 0,
    actions_failed: 0,
    notifications_sent: 0,
    errors: [],
  }

  for (const action of actions) {
    const { success, error } = await executeAction(action, userId)

    if (success) {
      result.actions_executed++
    } else if (error) {
      result.actions_failed++
      result.errors.push(error)
    }
  }

  return result
}
