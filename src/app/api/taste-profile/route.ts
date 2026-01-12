import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GENRES } from '@/lib/constants'
import { clearCachedRecommendations } from '@/app/api/recommendations/route'
import { errorResponse } from '@/lib/errors'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const { data: profile, error } = await supabase
      .from('taste_profiles')
      .select('genres, favorite_shows')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching taste profile:', error)
      return errorResponse('Failed to fetch taste profile', 500)
    }

    return NextResponse.json({
      genres: profile?.genres || [],
      favorite_shows: profile?.favorite_shows || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { genres, favorite_shows } = body

    // Validate genres if provided
    if (genres !== undefined) {
      if (!Array.isArray(genres)) {
        return errorResponse('genres must be an array', 400)
      }
      const invalidGenres = genres.filter((g: string) => !GENRES.includes(g as typeof GENRES[number]))
      if (invalidGenres.length > 0) {
        return errorResponse(`Invalid genre(s): ${invalidGenres.join(', ')}`, 400)
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      user_id: user.id,
    }
    if (genres !== undefined) {
      updateData.genres = genres
    }
    if (favorite_shows !== undefined) {
      updateData.favorite_shows = Array.isArray(favorite_shows) ? favorite_shows : []
    }

    const { error } = await supabase
      .from('taste_profiles')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating taste profile:', error)
      return errorResponse('Failed to update taste profile', 500)
    }

    // Clear recommendation cache so next fetch gets fresh data
    clearCachedRecommendations(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
