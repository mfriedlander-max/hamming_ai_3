import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WatchlistsResponse, Watchlist } from '@/lib/social/types'

export async function GET(): Promise<NextResponse<WatchlistsResponse | { error: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all watchlists where user is a member
  const { data, error } = await supabase
    .from('watchlists')
    .select(
      `
      id,
      name,
      created_by,
      created_at,
      watchlist_members(user_id),
      watchlist_items(id)
    `
    )
    .eq('watchlist_members.user_id', user.id)

  if (error) {
    console.error('Error fetching watchlists:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlists' }, { status: 500 })
  }

  const watchlists: Watchlist[] = (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    created_by: item.created_by,
    created_at: item.created_at,
    member_count: Array.isArray(item.watchlist_members) ? item.watchlist_members.length : 0,
    item_count: Array.isArray(item.watchlist_items) ? item.watchlist_items.length : 0,
  }))

  return NextResponse.json({ watchlists })
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
  const { name } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Create watchlist
  const { data: watchlist, error } = await supabase
    .from('watchlists')
    .insert({
      name: name.trim(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !watchlist) {
    console.error('Error creating watchlist:', error)
    return NextResponse.json({ error: 'Failed to create watchlist' }, { status: 500 })
  }

  // Add creator as owner
  const { error: memberError } = await supabase.from('watchlist_members').insert({
    watchlist_id: watchlist.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    console.error('Error adding creator as member:', memberError)
    // Still return the watchlist, the member was just not added
  }

  return NextResponse.json(watchlist, { status: 201 })
}
