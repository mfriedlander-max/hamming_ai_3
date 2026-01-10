import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ReminderType, CreateReminderInput } from '@/lib/types/reminder'

const VALID_REMINDER_TYPES: ReminderType[] = ['cancel', 'resubscribe']

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(
        `
        id,
        user_id,
        subscription_id,
        type,
        trigger_date,
        triggered,
        created_at,
        subscription:subscriptions (
          id,
          status,
          service:services (
            name
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('trigger_date', { ascending: true })

    if (error) {
      console.error('Error fetching reminders:', error)
      return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
    }

    // Transform the response to match ReminderWithSubscription interface
    const transformedReminders = reminders.map((reminder) => {
      // Supabase returns nested relations - subscription is an object (due to foreign key)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = reminder.subscription as any

      // Handle nested service - could be object or array depending on Supabase response
      let serviceName = 'Unknown Service'
      if (sub?.service) {
        if (Array.isArray(sub.service) && sub.service.length > 0) {
          serviceName = sub.service[0].name
        } else if (sub.service.name) {
          serviceName = sub.service.name
        }
      }

      return {
        id: reminder.id,
        user_id: reminder.user_id,
        subscription_id: reminder.subscription_id,
        type: reminder.type,
        trigger_date: reminder.trigger_date,
        triggered: reminder.triggered,
        created_at: reminder.created_at,
        subscription: {
          id: sub?.id ?? reminder.subscription_id,
          service_name: serviceName,
          status: sub?.status ?? 'unknown',
        },
      }
    })

    return NextResponse.json(transformedReminders)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const body: CreateReminderInput = await request.json()
    const { subscription_id, type, trigger_date } = body

    // Validate required fields
    if (!subscription_id) {
      return NextResponse.json({ error: 'subscription_id is required' }, { status: 400 })
    }

    if (!type || !VALID_REMINDER_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "type must be 'cancel' or 'resubscribe'" },
        { status: 400 }
      )
    }

    if (!trigger_date) {
      return NextResponse.json({ error: 'trigger_date is required' }, { status: 400 })
    }

    // Validate trigger_date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(trigger_date)) {
      return NextResponse.json(
        { error: 'trigger_date must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    // Validate subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, status, service:services (name)')
      .eq('id', subscription_id)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or does not belong to user' },
        { status: 400 }
      )
    }

    // Create the reminder
    const { data: reminder, error: insertError } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        subscription_id,
        type,
        trigger_date,
      })
      .select(
        `
        id,
        user_id,
        subscription_id,
        type,
        trigger_date,
        triggered,
        created_at
      `
      )
      .single()

    if (insertError) {
      console.error('Error creating reminder:', insertError)
      return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
    }

    // Transform response to include subscription details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = subscription.service as any
    let serviceName = 'Unknown Service'
    if (service) {
      if (Array.isArray(service) && service.length > 0) {
        serviceName = service[0].name
      } else if (service.name) {
        serviceName = service.name
      }
    }

    const responseData = {
      ...reminder,
      subscription: {
        id: subscription.id,
        service_name: serviceName,
        status: subscription.status,
      },
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
