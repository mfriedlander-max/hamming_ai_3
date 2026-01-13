import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OptimizedSchedule, ApplyScheduleResult, ServiceAction } from '@/lib/optimizer/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const schedule = body.schedule as OptimizedSchedule | undefined

    if (!schedule || !schedule.months) {
      return NextResponse.json(
        { error: 'Missing or invalid schedule in request body' },
        { status: 400 }
      )
    }

    // Get user's subscriptions to map service_id to subscription_id
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, service_id')
      .eq('user_id', user.id)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    const serviceToSubscription = new Map(
      (subscriptions || []).map((s) => [s.service_id, s.id])
    )

    // Collect all actions from the schedule
    const allActions: ServiceAction[] = []
    for (const month of schedule.months) {
      for (const action of month.actions) {
        allActions.push(action)
      }
    }

    // Create reminders for subscribe and cancel actions
    const remindersToCreate: {
      user_id: string
      subscription_id: string
      type: 'cancel' | 'resubscribe'
      trigger_date: string
    }[] = []

    for (const action of allActions) {
      const subscriptionId = serviceToSubscription.get(action.service_id)
      if (!subscriptionId) continue

      if (action.action === 'cancel') {
        remindersToCreate.push({
          user_id: user.id,
          subscription_id: subscriptionId,
          type: 'cancel',
          trigger_date: action.date,
        })
      } else if (action.action === 'subscribe') {
        remindersToCreate.push({
          user_id: user.id,
          subscription_id: subscriptionId,
          type: 'resubscribe',
          trigger_date: action.date,
        })
      }
    }

    // Insert reminders
    let remindersCreated = 0
    if (remindersToCreate.length > 0) {
      const { error: reminderError } = await supabase
        .from('reminders')
        .insert(remindersToCreate)

      if (reminderError) {
        console.error('Error creating reminders:', reminderError)
        // Continue even if reminders fail - still update board columns
      } else {
        remindersCreated = remindersToCreate.length
      }
    }

    // Update subscriptions to 'scheduled' board column
    // for any subscription that has actions in the schedule
    const subscriptionsWithActions = new Set<string>()
    for (const action of allActions) {
      if (action.action !== 'keep') {
        const subscriptionId = serviceToSubscription.get(action.service_id)
        if (subscriptionId) {
          subscriptionsWithActions.add(subscriptionId)
        }
      }
    }

    let subscriptionsUpdated = 0
    for (const subscriptionId of subscriptionsWithActions) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ board_column: 'scheduled' })
        .eq('id', subscriptionId)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      } else {
        subscriptionsUpdated++
      }
    }

    const result: ApplyScheduleResult = {
      reminders_created: remindersCreated,
      subscriptions_updated: subscriptionsUpdated,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error applying schedule:', error)
    return NextResponse.json(
      { error: 'Failed to apply schedule' },
      { status: 500 }
    )
  }
}
