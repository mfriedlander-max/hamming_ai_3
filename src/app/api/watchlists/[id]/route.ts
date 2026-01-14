import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WatchlistWithDetails, WatchlistMember, WatchlistItem } from '@/lib/social/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse<WatchlistWithDetails | { error: string }>> {
  const supabase = await createClient()
  const { id } = await context.params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('watchlists')
    .select(
      `
      id,
      name,
      created_by,
      created_at,
      watchlist_members(
        user_id,
        role,
        joined_at,
        profile:profiles!watchlist_members_user_id_fkey(name, email)
      ),
      watchlist_items(
        id,
        tmdb_id,
        content_type,
        title,
        poster_path,
        added_by,
        added_at,
        adder:profiles!watchlist_items_added_by_fkey(name)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 })
  }

  // Transform the data
  const members: WatchlistMember[] = (data.watchlist_members || []).map((m: Record<string, unknown>) => {
    const profile = m.profile as { name?: string | null; email?: string } | null
    return {
      watchlist_id: id,
      user_id: m.user_id as string,
      role: m.role as 'owner' | 'editor' | 'viewer',
      joined_at: m.joined_at as string,
      user_name: profile?.name || null,
      user_email: profile?.email,
    }
  })

  const items: WatchlistItem[] = (data.watchlist_items || []).map((i: Record<string, unknown>) => {
    const adder = i.adder as { name?: string | null } | null
    return {
      id: i.id as string,
      watchlist_id: id,
      tmdb_id: i.tmdb_id as number,
      content_type: i.content_type as 'movie' | 'tv',
      title: i.title as string,
      poster_path: i.poster_path as string | null,
      added_by: i.added_by as string | null,
      added_at: i.added_at as string,
      added_by_name: adder?.name || null,
    }
  })

  const watchlist: WatchlistWithDetails = {
    id: data.id,
    name: data.name,
    created_by: data.created_by,
    created_at: data.created_at,
    members,
    items,
  }

  return NextResponse.json(watchlist)
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await context.params

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

  // Update watchlist (RLS will ensure only owners can update)
  const { data, error } = await supabase
    .from('watchlists')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating watchlist:', error)
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await context.params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete watchlist (RLS will ensure only owners can delete)
  const { error } = await supabase.from('watchlists').delete().eq('id', id)

  if (error) {
    console.error('Error deleting watchlist:', error)
    return NextResponse.json({ error: 'Failed to delete watchlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
