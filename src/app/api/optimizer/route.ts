import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateOptimizerData } from '@/lib/optimizer/analyzer'
import { buildOptimizerPrompt, parseOptimizerResponse } from '@/lib/optimizer/prompt'
import { getMonthRange, getCurrentMonthString } from '@/lib/calendar/utils'
import type { OptimizedSchedule } from '@/lib/optimizer/types'
import type { CalendarResponse, ServiceReleases, CalendarMonth } from '@/lib/calendar/types'

// Simple in-memory cache with 1hr TTL
const cache = new Map<string, { data: OptimizedSchedule; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCachedSchedule(userId: string): OptimizedSchedule | null {
  const cached = cache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(userId)
  return null
}

function setCachedSchedule(userId: string, data: OptimizedSchedule): void {
  cache.set(userId, { data, timestamp: Date.now() })
}

export function clearCachedSchedule(userId: string): void {
  cache.delete(userId)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for force refresh
    const body = await request.json().catch(() => ({}))
    const forceRefresh = body.forceRefresh === true

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = getCachedSchedule(user.id)
      if (cached) {
        return NextResponse.json({ schedule: cached, cached: true })
      }
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    // Get user's subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        service_id,
        monthly_cost,
        status,
        service:services (
          id,
          name,
          slug
        )
      `
      )
      .eq('user_id', user.id)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // If no subscriptions, return empty schedule
    if (!subscriptions || subscriptions.length === 0) {
      const emptySchedule: OptimizedSchedule = {
        current_annual_cost: 0,
        optimized_annual_cost: 0,
        savings: 0,
        months: [],
      }
      return NextResponse.json({ schedule: emptySchedule, cached: false })
    }

    // Transform subscription data
    const transformedSubscriptions = subscriptions.map((sub) => {
      const serviceData = sub.service as unknown
      const service = Array.isArray(serviceData)
        ? serviceData[0]
        : (serviceData as { id: string; name: string; slug: string } | null)
      return {
        id: sub.id,
        service_id: sub.service_id,
        monthly_cost: sub.monthly_cost,
        status: sub.status as 'active' | 'paused',
        service: {
          id: service?.id || sub.service_id,
          name: service?.name || 'Unknown Service',
          slug: service?.slug || 'unknown',
        },
      }
    })

    // Get user's taste profile
    const { data: tasteProfile, error: tasteError } = await supabase
      .from('taste_profiles')
      .select('genres, favorite_shows')
      .eq('user_id', user.id)
      .single()

    if (tasteError && tasteError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay
      console.error('Error fetching taste profile:', tasteError)
    }

    const userTasteProfile = {
      genres: tasteProfile?.genres || [],
      favorite_shows: tasteProfile?.favorite_shows || [],
    }

    // Get content calendar for next 12 months
    const startMonth = getCurrentMonthString()
    const monthRange = getMonthRange(new Date(), 12)
    const startDate = `${monthRange[0]}-01`
    const lastMonth = monthRange[monthRange.length - 1]
    const endDate = `${lastMonth}-${new Date(parseInt(lastMonth.split('-')[0]), parseInt(lastMonth.split('-')[1]), 0).getDate()}`

    const serviceIds = transformedSubscriptions.map((s) => s.service_id)

    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, tmdb_id, title, type, release_date, genres, service_ids')
      .gte('release_date', startDate)
      .lte('release_date', endDate)
      .overlaps('service_ids', serviceIds)

    if (contentError) {
      console.error('Error fetching content:', contentError)
    }

    // Build calendar response structure
    const contentData = content || []
    const serviceMap = new Map(
      transformedSubscriptions.map((s) => [s.service_id, s.service.name])
    )

    const calendarMonths: CalendarMonth[] = monthRange.map((month) => {
      const monthContent = contentData.filter((c) => c.release_date.startsWith(month))

      const servicesMap = new Map<string, ServiceReleases>()

      // Initialize all subscribed services
      for (const sub of transformedSubscriptions) {
        servicesMap.set(sub.service_id, {
          service_id: sub.service_id,
          service_name: sub.service.name,
          releases: [],
        })
      }

      // Add content to appropriate services
      for (const item of monthContent) {
        for (const serviceId of item.service_ids || []) {
          const serviceName = serviceMap.get(serviceId)
          if (serviceName) {
            const existing = servicesMap.get(serviceId)
            if (existing) {
              existing.releases.push({
                id: item.id,
                tmdb_id: item.tmdb_id,
                title: item.title,
                type: item.type as 'movie' | 'tv',
                release_date: item.release_date,
                poster_url: null,
                genres: item.genres || [],
              })
            }
          }
        }
      }

      return {
        month,
        services: Array.from(servicesMap.values()),
      }
    })

    const calendarResponse: CalendarResponse = {
      months: calendarMonths,
    }

    // Aggregate data for optimizer
    const optimizerInput = aggregateOptimizerData(
      transformedSubscriptions,
      userTasteProfile,
      calendarResponse,
      startMonth
    )

    // Call Claude API
    const prompt = buildOptimizerPrompt(optimizerInput)

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate optimized schedule' },
        { status: 500 }
      )
    }

    const claudeData = await claudeResponse.json()
    const responseText = claudeData.content?.[0]?.text || ''

    // Parse the response
    const schedule = parseOptimizerResponse(responseText)

    // Cache the results
    setCachedSchedule(user.id, schedule)

    return NextResponse.json({ schedule, cached: false })
  } catch (error) {
    console.error('Error generating optimized schedule:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimized schedule' },
      { status: 500 }
    )
  }
}
