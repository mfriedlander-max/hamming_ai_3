import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type CalendarActionType = 'apply_all' | 'regenerate' | 'add_to_queue' | 'set_reminder' | 'remove_from_queue'

interface CalendarActionRequest {
  action: CalendarActionType
  release?: {
    id: string
    tmdb_id: number
    title: string
    content_type: 'movie' | 'tv'
    service_id: string
    service_name: string
    duration_minutes: number
    poster_path?: string
  }
  queue_item_id?: string
  release_date?: string
  service_id?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as CalendarActionRequest

  switch (body.action) {
    case 'apply_all':
      return handleApplyAll(supabase, user.id)

    case 'regenerate':
      return handleRegenerate(supabase, user.id)

    case 'add_to_queue':
      if (!body.release) {
        return NextResponse.json({ error: 'Release data required' }, { status: 400 })
      }
      return handleAddToQueue(supabase, user.id, body.release)

    case 'set_reminder':
      if (!body.release_date || !body.service_id) {
        return NextResponse.json({ error: 'Release date and service_id required' }, { status: 400 })
      }
      return handleSetReminder(supabase, user.id, body.release_date, body.service_id)

    case 'remove_from_queue':
      if (!body.queue_item_id) {
        return NextResponse.json({ error: 'Queue item ID required' }, { status: 400 })
      }
      return handleRemoveFromQueue(supabase, user.id, body.queue_item_id)

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}

async function handleApplyAll(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // Get cached optimizer plan
  const { data: planData } = await supabase
    .from('optimizer_plans')
    .select('plan')
    .eq('user_id', userId)
    .single()

  if (!planData) {
    return NextResponse.json({ error: 'No optimizer plan found' }, { status: 404 })
  }

  const plan = planData.plan as { this_week_actions?: Array<{ type: string; service_id: string; service_name: string; date: string; reason: string }> }
  const actions = plan.this_week_actions || []
  let actionsApplied = 0

  // Process each action
  for (const action of actions) {
    // Get subscription for this service
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', action.service_id)
      .single()

    if (!subscription) continue

    if (action.type === 'cancel' || action.type === 'resubscribe') {
      // Create reminder
      await supabase.from('reminders').insert({
        user_id: userId,
        subscription_id: subscription.id,
        type: action.type === 'cancel' ? 'cancel' : 'resubscribe',
        trigger_date: action.date,
      })
      actionsApplied++
    }

    // Update subscription to scheduled
    await supabase
      .from('subscriptions')
      .update({ board_column: 'scheduled' })
      .eq('id', subscription.id)
      .eq('user_id', userId)
  }

  return NextResponse.json({
    message: 'All actions applied',
    actions_applied: actionsApplied,
  })
}

async function handleRegenerate(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // Delete cached plan to force regeneration
  await supabase
    .from('optimizer_plans')
    .delete()
    .eq('user_id', userId)

  return NextResponse.json({
    message: 'Plan invalidated - will regenerate on next fetch',
  })
}

async function handleAddToQueue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  release: CalendarActionRequest['release']
) {
  if (!release) {
    return NextResponse.json({ error: 'Release data required' }, { status: 400 })
  }

  // Get next priority
  const { data: existingItems } = await supabase
    .from('queue_items')
    .select('priority')
    .eq('user_id', userId)
    .order('priority', { ascending: false })

  const nextPriority = existingItems && existingItems.length > 0
    ? (existingItems[0].priority as number) + 1
    : 1

  const { data: item, error } = await supabase
    .from('queue_items')
    .insert({
      user_id: userId,
      tmdb_id: release.tmdb_id,
      title: release.title,
      content_type: release.content_type,
      service_id: release.service_id,
      service_name: release.service_name,
      poster_path: release.poster_path || null,
      duration_minutes: release.duration_minutes,
      priority: nextPriority,
      source: 'manual',
      deadline: null,
    })
    .select()
    .single()

  if (error) {
    // Handle duplicate key constraint (item already in queue)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This item is already in your queue' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item }, { status: 201 })
}

async function handleSetReminder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  releaseDate: string,
  serviceId: string
) {
  // Get subscription for this service
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'No subscription found for service' }, { status: 404 })
  }

  const { data: reminder, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      type: 'resubscribe',
      trigger_date: releaseDate,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reminder }, { status: 201 })
}

async function handleRemoveFromQueue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  queueItemId: string
) {
  const { error } = await supabase
    .from('queue_items')
    .delete()
    .eq('id', queueItemId)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
