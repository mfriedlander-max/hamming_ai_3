import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ThisWeekAction, OptimizedPlan } from '@/lib/optimizer-v2/types'
import type { ApplyPlanRequest, ApplyPlanResponse, AutoAction } from '@/lib/auto-pilot/types'
import {
  createAutoPilotNotification,
  sendAutoPilotNotification,
} from '@/lib/auto-pilot/notification-sender'
import { randomUUID } from 'crypto'

/**
 * POST /api/optimizer-v2/apply
 *
 * Apply the optimizer plan by:
 * 1. Creating reminders for cancel/subscribe/set_reminder actions
 * 2. Creating auto_action entries for tracking
 * 3. Updating subscription board_column to 'scheduled'
 * 4. Sending confirmation notification
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as ApplyPlanRequest
  const { actions_to_apply } = body

  // 1. Fetch cached plan
  const { data: planData, error: planError } = await supabase
    .from('optimizer_plans')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (planError || !planData?.plan) {
    return NextResponse.json({ error: 'No optimizer plan found' }, { status: 404 })
  }

  const plan = planData.plan as OptimizedPlan
  let actionsToProcess = plan.this_week_actions || []

  // 2. Filter actions if specific ones requested
  if (actions_to_apply && actions_to_apply.length > 0) {
    actionsToProcess = actionsToProcess.filter((_, index) =>
      actions_to_apply.includes(String(index))
    )
  }

  // Tracking
  let reminders_created = 0
  let subscriptions_updated = 0
  let auto_actions_created = 0
  const actions_applied: AutoAction[] = []

  // 3. Process each action
  for (const action of actionsToProcess) {
    const now = new Date().toISOString()
    const actionId = randomUUID()

    // Create reminder for reminder-type actions
    if (['set_reminder', 'cancel', 'subscribe'].includes(action.type)) {
      const reminderType =
        action.type === 'cancel'
          ? 'cancel'
          : action.type === 'subscribe'
            ? 'resubscribe'
            : 'custom'

      await supabase.from('reminders').insert({
        user_id: user.id,
        subscription_id: action.service_id,
        reminder_type: reminderType,
        reminder_date: action.date,
        message: action.reason,
      })
      reminders_created++
    }

    // Create auto_action entry
    await supabase.from('auto_actions').insert({
      id: actionId,
      user_id: user.id,
      action_type: action.type,
      service_id: action.service_id,
      scheduled_date: action.date,
      status: 'pending',
      reason: action.reason,
    })
    auto_actions_created++

    // Update subscription board_column to 'scheduled'
    await supabase
      .from('subscriptions')
      .update({ board_column: 'scheduled' })
      .eq('id', action.service_id)
    subscriptions_updated++

    // Track applied action
    actions_applied.push({
      id: actionId,
      user_id: user.id,
      action_type: action.type,
      service_id: action.service_id,
      service_name: action.service_name,
      scheduled_date: action.date,
      executed_at: null,
      status: 'pending',
      reason: action.reason,
      created_at: now,
    })
  }

  // 4. Send confirmation notification
  const notification = createAutoPilotNotification('action_pending', {
    count: actionsToProcess.length,
    reason: `${actionsToProcess.length} action(s) scheduled from your optimizer plan.`,
  })
  await sendAutoPilotNotification(user.id, notification)

  const response: ApplyPlanResponse = {
    reminders_created,
    subscriptions_updated,
    auto_actions_created,
    actions_applied,
  }

  return NextResponse.json(response)
}
