import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Notification, NotificationType, NotificationsResponse } from '@/lib/notifications/types'

const VALID_NOTIFICATION_TYPES: NotificationType[] = [
  'content_release',
  'pause_suggestion',
  'resubscribe_reminder',
  'price_change',
]

export async function GET(): Promise<NextResponse<NotificationsResponse | { error: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  const notifications = data as Notification[]
  const unread_count = notifications.filter((n) => !n.read).length

  return NextResponse.json({ notifications, unread_count })
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { notification_id, mark_all_read } = body

  if (mark_all_read) {
    // Mark all user's notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
  } else if (notification_id) {
    // Mark single notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: 'Missing notification_id or mark_all_read' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type, title, body: notificationBody, data: notificationData } = body

  // Validate notification type
  if (!VALID_NOTIFICATION_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type,
      title,
      body: notificationBody || null,
      data: notificationData || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
