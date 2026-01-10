import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/claude/client'
import type { ServiceContent, Recommendation } from '@/lib/types/content'

// Simple in-memory cache with 1hr TTL
const cache = new Map<string, { data: Recommendation[]; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCachedRecommendations(userId: string): Recommendation[] | null {
  const cached = cache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(userId)
  return null
}

function setCachedRecommendations(userId: string, data: Recommendation[]): void {
  cache.set(userId, { data, timestamp: Date.now() })
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
      const cached = getCachedRecommendations(user.id)
      if (cached) {
        return NextResponse.json({ recommendations: cached, cached: true })
      }
    }

    // Get user's subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        service_id,
        status,
        service:services (
          id,
          name
        )
      `
      )
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ recommendations: [], message: 'No active subscriptions' })
    }

    // For now, mock the service content (Phase 4 will provide real content)
    // In integration, this would call /api/content/matches or similar
    const serviceContent: ServiceContent[] = subscriptions.map((sub) => {
      // Supabase returns service as array when using nested select
      const serviceData = sub.service as unknown
      const service = Array.isArray(serviceData) ? serviceData[0] : serviceData as { id: string; name: string } | null
      return {
        service_id: sub.service_id,
        service_name: service?.name || 'Unknown Service',
        upcoming: [], // Will be populated by Phase 4 integration
      }
    })

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(apiKey, serviceContent)

    // Cache the results
    setCachedRecommendations(user.id, recommendations)

    return NextResponse.json({ recommendations, cached: false })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// GET endpoint to retrieve cached recommendations
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cached = getCachedRecommendations(user.id)
    if (cached) {
      return NextResponse.json({ recommendations: cached, cached: true })
    }

    return NextResponse.json({ recommendations: null, message: 'No cached recommendations' })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
