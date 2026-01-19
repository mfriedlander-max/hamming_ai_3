import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTMDBClient } from '@/lib/tmdb/client'
import { matchContentToTaste } from '@/lib/tmdb/matching'
import { TMDB_PROVIDER_MAP } from '@/lib/tmdb/types'
import type { MatchedContent } from '@/lib/types/content'

const CACHE_TTL_HOURS = 24

/**
 * POST /api/content/sync
 * Syncs content from TMDB for user's subscribed services
 * Caches results in the database with 24hr TTL
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for TMDB API key
    const tmdbApiKey = process.env.TMDB_API_KEY
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY not configured')
      return NextResponse.json(
        { error: 'Content service not configured' },
        { status: 503 }
      )
    }

    // Get user's subscriptions with service info
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        service_id,
        status,
        service:services (
          id,
          name,
          slug,
          tmdb_provider_id
        )
      `
      )
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ synced: 0, services: [] })
    }

    // Get user's taste profile
    const { data: tasteProfile, error: tasteError } = await supabase
      .from('taste_profiles')
      .select('genres, favorite_shows')
      .eq('user_id', user.id)
      .single()

    if (tasteError || !tasteProfile) {
      console.error('Error fetching taste profile:', tasteError)
      return NextResponse.json(
        { error: 'Taste profile not found. Complete onboarding first.' },
        { status: 400 }
      )
    }

    const tmdb = createTMDBClient(tmdbApiKey)
    const results: { service_id: string; service_name: string; synced: number }[] = []
    const now = new Date()
    const cacheExpiry = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000)

    // Process each subscription
    for (const subscription of subscriptions) {
      // Supabase returns joined relations - handle both array and object formats
      const serviceData = subscription.service
      const service = Array.isArray(serviceData) ? serviceData[0] : serviceData

      if (!service) continue

      const { id: serviceId, name: serviceName, slug: serviceSlug, tmdb_provider_id } = service as {
        id: string
        name: string
        slug: string
        tmdb_provider_id: number | null
      }

      // Get TMDB provider ID from service or our mapping
      const providerId =
        tmdb_provider_id ||
        TMDB_PROVIDER_MAP[serviceSlug as keyof typeof TMDB_PROVIDER_MAP]

      if (!providerId) {
        console.warn(`No TMDB provider ID for service: ${serviceSlug}`)
        continue
      }

      try {
        // Fetch movies and TV shows for this provider
        const [moviesResponse, tvResponse] = await Promise.all([
          tmdb.getMoviesByProvider(providerId),
          tmdb.getTVShowsByProvider(providerId),
        ])

        // Match content to user taste
        // Map database column 'genres' to interface 'favorite_genres'
        const tasteForMatching = {
          favorite_genres: tasteProfile.genres || [],
          favorite_shows: tasteProfile.favorite_shows || [],
        }
        console.log(`[SYNC DEBUG] ${serviceName}: TMDB returned ${moviesResponse.results.length} movies, ${tvResponse.results.length} TV shows`)
        console.log(`[SYNC DEBUG] User taste profile:`, tasteForMatching)

        const matchedMovies = matchContentToTaste(
          moviesResponse.results,
          'movie',
          tasteForMatching
        )
        const matchedShows = matchContentToTaste(
          tvResponse.results,
          'tv',
          tasteForMatching
        )

        const allMatched = [...matchedMovies, ...matchedShows]
        console.log(`[SYNC DEBUG] ${serviceName}: Matched ${matchedMovies.length} movies, ${matchedShows.length} TV shows (total: ${allMatched.length})`)

        // Delete old cached content for this service/user
        await supabase
          .from('content')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId)

        // Insert new matched content
        if (allMatched.length > 0) {
          const contentToInsert = allMatched.map((item: MatchedContent) => ({
            user_id: user.id,
            service_id: serviceId,
            tmdb_id: item.tmdb_id,
            title: item.title,
            type: item.type,
            release_date: item.release_date || null,
            genres: item.genres,
            poster_url: item.poster_url || null,
            match_score: item.match_score,
            match_reason: item.match_reason,
            cached_until: cacheExpiry.toISOString(),
          }))

          const { error: insertError } = await supabase
            .from('content')
            .insert(contentToInsert)

          if (insertError) {
            console.error(`Error inserting content for ${serviceName}:`, insertError)
          }
        }

        results.push({
          service_id: serviceId,
          service_name: serviceName,
          synced: allMatched.length,
        })
      } catch (error) {
        console.error(`Error fetching TMDB data for ${serviceName}:`, error)
        results.push({
          service_id: serviceId,
          service_name: serviceName,
          synced: 0,
        })
      }
    }

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0)

    return NextResponse.json({
      synced: totalSynced,
      services: results,
      cached_until: cacheExpiry.toISOString(),
    })
  } catch (error) {
    console.error('Unexpected error in content sync:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
