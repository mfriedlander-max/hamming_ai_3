import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WatchlistRole } from '@/lib/social/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

const VALID_ROLES: WatchlistRole[] = ['owner', 'editor', 'viewer']

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const supabase = await createClient()
  const { id: watchlistId } = await context.params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { friend_id, role = 'viewer' } = body

  if (!friend_id) {
    return NextResponse.json({ error: 'friend_id is required' }, { status: 400 })
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: 'role must be "owner", "editor", or "viewer"' },
      { status: 400 }
    )
  }

  // Add member to watchlist (RLS will ensure only owners can add members)
  const { data, error } = await supabase
    .from('watchlist_members')
    .insert({
      watchlist_id: watchlistId,
      user_id: friend_id,
      role,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding member to watchlist:', error)
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const supabase = await createClient()
  const { id: watchlistId } = await context.params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const userId = url.searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  // Delete member from watchlist (RLS will ensure only owners can remove)
  const { error } = await supabase
    .from('watchlist_members')
    .delete()
    .eq('watchlist_id', watchlistId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing member from watchlist:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
