import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface WatchTogetherRequest {
  queue_item_id: string
  friend_ids: string[]
  scheduled_date?: string
  message?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as WatchTogetherRequest

  // Validate required fields
  if (!body.queue_item_id || !body.friend_ids || body.friend_ids.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get queue item details
  const { data: queueItem, error: queueError } = await supabase
    .from('queue_items')
    .select('id, title, tmdb_id')
    .eq('id', body.queue_item_id)
    .eq('user_id', user.id)
    .single()

  if (queueError || !queueItem) {
    return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
  }

  // Create watch-together session
  const { data: session, error: sessionError } = await supabase
    .from('watch_together_sessions')
    .insert({
      queue_item_id: body.queue_item_id,
      organizer_id: user.id,
      participant_ids: body.friend_ids,
      scheduled_date: body.scheduled_date || null,
      message: body.message || null,
      status: 'pending',
    })
    .select()
    .single()

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 })
  }

  // Send notifications to friends
  const notifications = body.friend_ids.map((friendId) => ({
    user_id: friendId,
    type: 'watch_together_invite',
    title: 'Watch Together Invitation',
    body: `You've been invited to watch "${queueItem.title}" together!`,
    data: {
      session_id: session.id,
      queue_item_id: body.queue_item_id,
      organizer_id: user.id,
    },
  }))

  await supabase.from('notifications').insert(notifications)

  return NextResponse.json({ session }, { status: 201 })
}
