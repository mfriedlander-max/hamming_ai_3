import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContentType } from '@/lib/social/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

const VALID_CONTENT_TYPES: ContentType[] = ['movie', 'tv']

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
  const { tmdb_id, content_type, title, poster_path } = body

  if (!tmdb_id || !content_type || !title) {
    return NextResponse.json(
      { error: 'tmdb_id, content_type, and title are required' },
      { status: 400 }
    )
  }

  if (!VALID_CONTENT_TYPES.includes(content_type)) {
    return NextResponse.json(
      { error: 'content_type must be "movie" or "tv"' },
      { status: 400 }
    )
  }

  // Add item to watchlist (RLS will ensure only editors/owners can add)
  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      watchlist_id: watchlistId,
      tmdb_id,
      content_type,
      title,
      poster_path: poster_path || null,
      added_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding item to watchlist:', error)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
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
  const itemId = url.searchParams.get('item_id')

  if (!itemId) {
    return NextResponse.json({ error: 'item_id is required' }, { status: 400 })
  }

  // Delete item from watchlist (RLS will ensure only editors/owners can delete)
  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', itemId)
    .eq('watchlist_id', watchlistId)

  if (error) {
    console.error('Error removing item from watchlist:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
