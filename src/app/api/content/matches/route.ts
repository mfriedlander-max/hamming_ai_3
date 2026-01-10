import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ServiceContent, MatchedContent } from '@/lib/types/content'

/**
 * GET /api/content/matches
 * Returns cached matched content for user's subscribed services
 * Optional query params:
 * - service_id: Filter by specific service
 * - min_score: Minimum match score (default: 0)
 * - limit: Max items per service (default: 10)
 */
export async function GET(request: Request) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service_id')
    const minScore = parseInt(searchParams.get('min_score') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build query
    let query = supabase
      .from('content')
      .select(
        `
        id,
        tmdb_id,
        title,
        type,
        release_date,
        genres,
        match_score,
        match_reason,
        service_id,
        cached_until,
        service:services (
          id,
          name,
          slug,
          logo_url
        )
      `
      )
      .eq('user_id', user.id)
      .gte('match_score', minScore)
      .order('match_score', { ascending: false })

    // Filter by service if specified
    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    // Filter out expired cache
    const now = new Date().toISOString()
    query = query.gt('cached_until', now)

    const { data: content, error } = await query

    if (error) {
      console.error('Error fetching content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      )
    }

    // Check if cache is empty (needs sync)
    if (!content || content.length === 0) {
      return NextResponse.json({
        services: [],
        needs_sync: true,
        message: 'No cached content found. Run POST /api/content/sync first.',
      })
    }

    // Group content by service
    const serviceMap = new Map<
      string,
      {
        service_id: string
        service_name: string
        service_logo: string | null
        items: MatchedContent[]
      }
    >()

    for (const item of content) {
      // Supabase returns joined relations - handle both array and object formats
      const serviceData = item.service
      const service = Array.isArray(serviceData) ? serviceData[0] : serviceData

      if (!service) continue

      const { id: svcId, name: svcName, logo_url: svcLogo } = service as {
        id: string
        name: string
        slug: string
        logo_url: string | null
      }

      if (!serviceMap.has(svcId)) {
        serviceMap.set(svcId, {
          service_id: svcId,
          service_name: svcName,
          service_logo: svcLogo,
          items: [],
        })
      }

      const serviceGroup = serviceMap.get(svcId)!
      if (serviceGroup.items.length < limit) {
        serviceGroup.items.push({
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          type: item.type as 'movie' | 'tv',
          release_date: item.release_date || '',
          genres: item.genres || [],
          match_score: item.match_score,
          match_reason: item.match_reason || '',
        })
      }
    }

    // Convert to ServiceContent array
    const services: ServiceContent[] = Array.from(serviceMap.values()).map(
      (group) => ({
        service_id: group.service_id,
        service_name: group.service_name,
        upcoming: group.items,
      })
    )

    // Sort services by their top match score
    services.sort((a, b) => {
      const aTopScore = a.upcoming[0]?.match_score || 0
      const bTopScore = b.upcoming[0]?.match_score || 0
      return bTopScore - aTopScore
    })

    return NextResponse.json({
      services,
      needs_sync: false,
      total_matches: content.length,
    })
  } catch (error) {
    console.error('Unexpected error in content matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
