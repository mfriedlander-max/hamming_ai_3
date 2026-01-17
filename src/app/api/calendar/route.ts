import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMonthRange } from '@/lib/calendar/utils'
import { enrichReleasesWithFriendActivity } from '@/lib/social-integration/friend-activity'
import type {
  ContentRelease,
  CalendarMonth,
  CalendarResponse,
} from '@/lib/calendar/types'

interface ContentRow {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  release_date: string
  genres: string[]
  service_ids: string[]
}

interface SubscriptionRow {
  id: string
  service_id: string
  service: { name: string } | { name: string }[]
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate) {
      return NextResponse.json(
        { error: 'start date is required' },
        { status: 400 }
      )
    }

    if (!endDate) {
      return NextResponse.json(
        { error: 'end date is required' },
        { status: 400 }
      )
    }

    // Fetch user's subscriptions with service names
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, service_id, service:services(name)')
      .eq('user_id', user.id)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    // If no subscriptions, return empty calendar
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ months: [] })
    }

    // Get service IDs the user is subscribed to
    const subscribedServiceIds = subscriptions.map((sub) => sub.service_id)

    // Fetch content that's available on user's subscribed services
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, tmdb_id, title, type, release_date, genres, service_ids')
      .gte('release_date', startDate)
      .lte('release_date', endDate)
      .overlaps('service_ids', subscribedServiceIds)

    if (contentError) {
      console.error('Error fetching content:', contentError)
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      )
    }

    // Build service info map
    const serviceInfo = new Map<string, string>()
    subscriptions.forEach((sub: SubscriptionRow) => {
      const service = sub.service
      const serviceName = Array.isArray(service)
        ? service[0]?.name ?? 'Unknown'
        : service?.name ?? 'Unknown'
      serviceInfo.set(sub.service_id, serviceName)
    })

    // Generate month range
    const startParts = startDate.split('-').map(Number)
    const endParts = endDate.split('-').map(Number)
    const startMonth = new Date(startParts[0], startParts[1] - 1, 1)
    const endMonth = new Date(endParts[0], endParts[1] - 1, 1)

    // Calculate number of months
    const monthDiff =
      (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
      (endMonth.getMonth() - startMonth.getMonth()) +
      1

    const monthStrings = getMonthRange(startMonth, monthDiff)

    // Group content by month and service
    const months: CalendarMonth[] = monthStrings.map((monthStr) => {
      const services = subscriptions.map((sub: SubscriptionRow) => {
        const serviceName = serviceInfo.get(sub.service_id) ?? 'Unknown'

        // Filter content for this service and month
        const serviceContent = (content ?? []).filter((c: ContentRow) => {
          // Check if content is on this service
          if (!c.service_ids.includes(sub.service_id)) {
            return false
          }

          // Check if release date is in this month
          const releaseMonth = c.release_date.substring(0, 7)
          return releaseMonth === monthStr
        })

        // Transform to ContentRelease format
        const releases: ContentRelease[] = serviceContent.map(
          (c: ContentRow) => ({
            id: c.id,
            tmdb_id: c.tmdb_id,
            title: c.title,
            type: c.type,
            release_date: c.release_date,
            poster_url: null, // Can be enhanced later with TMDB poster URLs
            genres: c.genres,
          })
        )

        return {
          service_id: sub.service_id,
          service_name: serviceName,
          subscription_id: sub.id,
          releases,
        }
      })

      return {
        month: monthStr,
        services,
      }
    })

    // Enrich releases with friend activity (friend_watching flag)
    // Collect all releases across all months and services
    const allReleases: ContentRelease[] = []
    for (const month of months) {
      for (const service of month.services) {
        allReleases.push(...service.releases)
      }
    }

    // Enrich with friend activity
    const enrichedReleasesMap = new Map<string, ContentRelease>()
    if (allReleases.length > 0) {
      const enrichedReleases = await enrichReleasesWithFriendActivity(
        allReleases,
        user.id
      )
      for (const release of enrichedReleases) {
        enrichedReleasesMap.set(release.id, release)
      }

      // Update the releases in months with enriched data
      for (const month of months) {
        for (const service of month.services) {
          service.releases = service.releases.map(
            (r) => enrichedReleasesMap.get(r.id) || r
          )
        }
      }
    }

    const response: CalendarResponse = { months }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
