import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createResubscribeNotification } from '@/lib/notifications/generator'

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_STATUSES = ['active', 'paused']
const VALID_BOARD_COLUMNS = ['active', 'consider', 'paused', 'scheduled']

/**
 * Calculate default resume date (30 days from now)
 */
function getDefaultResumeDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, board_column, resume_date } = body

    // Build update object based on provided fields
    const updateData: { status?: string; board_column?: string } = {}

    // Validate status if provided
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'status must be either "active" or "paused"' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    // Validate board_column if provided
    if (board_column !== undefined) {
      if (!VALID_BOARD_COLUMNS.includes(board_column)) {
        return NextResponse.json(
          { error: 'board_column must be one of: active, consider, paused, scheduled' },
          { status: 400 }
        )
      }
      updateData.board_column = board_column
    }

    // Require at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'At least one of status or board_column must be provided' },
        { status: 400 }
      )
    }

    // Verify ownership and update
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this subscription
      .select(
        `
        id,
        user_id,
        service_id,
        status,
        monthly_cost,
        created_at,
        board_column,
        service:services (
          id,
          name,
          slug,
          logo_url,
          default_price,
          tmdb_provider_id,
          cancel_url
        )
      `
      )
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }
      console.error('Error updating subscription:', error)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Auto-remind: When subscription is moved to 'paused' board, create reminder and notification
    if (board_column === 'paused' && subscription) {
      // Service is an array from the join, get first element
      const service = Array.isArray(subscription.service)
        ? subscription.service[0]
        : subscription.service
      const serviceName = service?.name || 'Service'
      const reminderDate = resume_date || getDefaultResumeDate()

      // Check user's notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('resubscribe_reminder')
        .eq('user_id', user.id)
        .single()

      // Default to true if no preferences exist
      const shouldNotify = prefs?.resubscribe_reminder !== false

      // Create the resubscribe reminder
      await supabase.from('reminders').insert({
        user_id: user.id,
        subscription_id: id,
        type: 'resubscribe',
        trigger_date: reminderDate,
      })

      // Create notification if enabled
      if (shouldNotify) {
        const notificationInput = createResubscribeNotification(
          user.id,
          serviceName,
          id,
          reminderDate
        )
        await supabase.from('notifications').insert({
          user_id: notificationInput.user_id,
          type: notificationInput.type,
          title: notificationInput.title,
          body: notificationInput.body,
          data: notificationInput.data,
        })
      }
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this subscription

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
