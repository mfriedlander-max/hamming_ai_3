import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTMDBClient } from '@/lib/tmdb/client'
import { calculateBingePlan } from '@/lib/binge/calculator'

const DEFAULT_WATCH_SPEED = 2

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

    // Parse request body
    const body = await request.json()
    const { tmdb_id, service_id, release_date, watch_speed: requestWatchSpeed } = body

    // Validate required fields
    if (!tmdb_id || !service_id || !release_date) {
      return NextResponse.json(
        { error: 'Missing required fields: tmdb_id, service_id, release_date' },
        { status: 400 }
      )
    }

    // Get user's profile for watch_speed default
    const { data: profile } = await supabase
      .from('profiles')
      .select('watch_speed')
      .eq('id', user.id)
      .single()

    const watchSpeed = requestWatchSpeed || profile?.watch_speed || DEFAULT_WATCH_SPEED

    // Get user's subscription for this service
    const { data: subscription, error: subError } = await supabase
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
      .eq('service_id', service_id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Fetch show details from TMDB
    const tmdbApiKey = process.env.TMDB_API_KEY
    if (!tmdbApiKey) {
      return NextResponse.json({ error: 'TMDB API not configured' }, { status: 503 })
    }

    const tmdbClient = createTMDBClient(tmdbApiKey)
    const showDetails = await tmdbClient.getShowDetails(tmdb_id)

    // Transform service data
    const serviceData = subscription.service as unknown
    const service = Array.isArray(serviceData)
      ? serviceData[0]
      : (serviceData as { id: string; name: string; slug: string } | null)

    // Calculate binge plan
    const plan = calculateBingePlan({
      show: showDetails,
      service: {
        id: subscription.service_id,
        name: service?.name || 'Unknown Service',
        monthly_cost: subscription.monthly_cost,
      },
      release_date,
      watch_speed: watchSpeed,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error generating binge plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate binge plan' },
      { status: 500 }
    )
  }
}
