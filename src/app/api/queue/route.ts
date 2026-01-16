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

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const { error } = await supabase
    .from('queue_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
