import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateQueueItemInput, QueueItem } from '@/lib/queue/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: items, error } = await supabase
    .from('queue_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('removed', false)
    .order('priority', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    items: items as QueueItem[],
    total: items.length,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as CreateQueueItemInput

  // Validate required fields
  if (!body.tmdb_id || !body.title || !body.content_type || !body.service_id || !body.service_name || !body.duration_minutes) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get current max priority for ordering
  const { data: existingItems } = await supabase
    .from('queue_items')
    .select('priority')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })

  const nextPriority = existingItems && existingItems.length > 0
    ? (existingItems[0].priority as number) + 1
    : 1

  const newItem = {
    user_id: user.id,
    tmdb_id: body.tmdb_id,
    title: body.title,
    content_type: body.content_type,
    service_id: body.service_id,
    service_name: body.service_name,
    poster_path: body.poster_path || null,
    duration_minutes: body.duration_minutes,
    priority: body.priority ?? nextPriority,
    source: body.source || 'manual',
    deadline: body.deadline || null,
  }

  const { data: item, error } = await supabase
    .from('queue_items')
    .insert(newItem)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const tmdbId = url.searchParams.get('tmdb_id')

  // Soft-delete by setting removed = true
  // This prevents optimizer from re-adding the item
  if (id) {
    // Remove by queue_item id (user-added item)
    const { error } = await supabase
      .from('queue_items')
      .update({ removed: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else if (tmdbId) {
    // Remove by tmdb_id (optimizer suggestion that wasn't in queue_items)
    // Insert a "removed" placeholder to prevent it from reappearing
    const { error } = await supabase
      .from('queue_items')
      .upsert(
        {
          user_id: user.id,
          tmdb_id: parseInt(tmdbId),
          title: 'Removed',  // Placeholder, we don't display removed items
          content_type: 'movie',  // Default, doesn't matter for removed items
          service_id: '00000000-0000-0000-0000-000000000000',  // Placeholder
          service_name: 'Unknown',
          duration_minutes: 0,
          removed: true,
        },
        { onConflict: 'user_id,tmdb_id,content_type' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: 'Missing id or tmdb_id parameter' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
