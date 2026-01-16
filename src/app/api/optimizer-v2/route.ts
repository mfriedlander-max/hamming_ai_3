import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOptimizedPlan } from '@/lib/optimizer-v2/optimizer'
import { shouldRecalculate } from '@/lib/optimizer-v2/recalculator'
import type {
  OptimizerInputs,
  OptimizedPlan,
  OptimizeResponse,
  UserSubscription,
  WatchlistItemInput,
  FriendShareInput,
  BingePlanInput,
  ContentReleaseInput,
} from '@/lib/optimizer-v2/types'

/**
 * Fetch all required data for the optimizer
 */
async function fetchOptimizerInputs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<OptimizerInputs> {
  // Fetch subscriptions
  const { data: subscriptions } = await supabase
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
    .eq('user_id', userId)

  const transformedSubscriptions: UserSubscription[] = (subscriptions || []).map(
    (sub) => {
      const serviceData = sub.service as unknown
      const service = Array.isArray(serviceData)
        ? serviceData[0]
        : (serviceData as { id: string; name: string; slug: string } | null)
      return {
        id: sub.id,
        service_id: sub.service_id,
        service_name: service?.name || 'Unknown',
        monthly_cost: sub.monthly_cost,
        status: sub.status as 'active' | 'paused',
      }
    }
  )

  // Fetch taste profile
  const { data: tasteProfile } = await supabase
    .from('taste_profiles')
    .select('genres, favorite_shows')
    .eq('user_id', userId)
    .single()

  // Fetch watchlist items
  const { data: watchlistItems } = await supabase
    .from('watchlist_items')
    .select('tmdb_id, content_type, title, poster_path')
    .eq('user_id', userId)

  const transformedWatchlist: WatchlistItemInput[] = (watchlistItems || []).map(
    (item) => ({
      tmdb_id: item.tmdb_id,
      content_type: item.content_type as 'movie' | 'tv',
      title: item.title,
      poster_path: item.poster_path,
    })
  )

  // Fetch friend shares
  const { data: friendShares } = await supabase
    .from('friend_shares')
    .select('tmdb_id, content_type, title, friend_id, friend_name, shared_at')
    .eq('recipient_id', userId)

  const transformedShares: FriendShareInput[] = (friendShares || []).map(
    (share) => ({
      tmdb_id: share.tmdb_id,
      content_type: share.content_type as 'movie' | 'tv',
      title: share.title,
      friend_id: share.friend_id,
      friend_name: share.friend_name || 'Friend',
      shared_at: share.shared_at,
    })
  )

  // Fetch binge plans
  const { data: bingePlans } = await supabase
    .from('binge_plans')
    .select(
      'show_id, show_title, service_id, service_name, total_episodes, subscribe_date, cancel_date, poster_url'
    )
    .eq('user_id', userId)

  const transformedBingePlans: BingePlanInput[] = (bingePlans || []).map(
    (plan) => ({
      show_id: plan.show_id,
      show_title: plan.show_title,
      service_id: plan.service_id,
      service_name: plan.service_name,
      total_episodes: plan.total_episodes,
      subscribe_date: plan.subscribe_date,
      cancel_date: plan.cancel_date,
      poster_url: plan.poster_url,
    })
  )

  // Fetch content releases for next 90 days
  const now = new Date()
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 90)

  const serviceIds = transformedSubscriptions.map((s) => s.service_id)

  const { data: content } = await supabase
    .from('content')
    .select(
      'tmdb_id, title, type, release_date, genres, service_ids, poster_path, runtime_minutes, episode_count'
    )
    .gte('release_date', now.toISOString().split('T')[0])
    .lte('release_date', endDate.toISOString().split('T')[0])
    .overlaps('service_ids', serviceIds)

  const transformedContent: ContentReleaseInput[] = (content || []).map(
    (item) => ({
      tmdb_id: item.tmdb_id,
      title: item.title,
      type: item.type as 'movie' | 'tv',
      release_date: item.release_date,
      genres: item.genres || [],
      service_ids: item.service_ids || [],
      poster_path: item.poster_path,
      runtime_minutes: item.runtime_minutes,
      episode_count: item.episode_count,
    })
  )

  return {
    subscriptions: transformedSubscriptions,
    taste_profile: {
      genres: tasteProfile?.genres || [],
      favorite_shows: tasteProfile?.favorite_shows || [],
    },
    watch_time: {
      watch_speed: 2, // Default: 2 episodes per day
      hours_per_week: 10, // Default: 10 hours per week
    },
    watchlist_items: transformedWatchlist,
    friend_shares: transformedShares,
    binge_plans: transformedBingePlans,
    content_releases: transformedContent,
  }
}

/**
 * Get cached plan from database
 */
async function getCachedPlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ plan: OptimizedPlan; inputs_hash: string } | null> {
  const { data, error } = await supabase
    .from('optimizer_plans')
    .select('plan, inputs_hash')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    plan: data.plan as OptimizedPlan,
    inputs_hash: data.inputs_hash,
  }
}

/**
 * Save plan to database cache
 */
async function savePlanToCache(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  plan: OptimizedPlan
): Promise<void> {
  await supabase.from('optimizer_plans').upsert(
    {
      user_id: userId,
      plan,
      inputs_hash: plan.inputs_hash,
      generated_at: plan.generated_at,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    { onConflict: 'user_id' }
  )
}

export async function POST(request: Request): Promise<NextResponse<OptimizeResponse | { error: string }>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body for force_refresh option
    const body = await request.json().catch(() => ({}))
    const forceRefresh = body.force_refresh === true

    // Fetch inputs
    const inputs = await fetchOptimizerInputs(supabase, user.id)

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = await getCachedPlan(supabase, user.id)
      if (cached && !shouldRecalculate(inputs, cached.plan)) {
        return NextResponse.json({
          plan: cached.plan,
          from_cache: true,
        })
      }
    }

    // Generate new plan
    const plan = generateOptimizedPlan(inputs)

    // Save to cache
    await savePlanToCache(supabase, user.id, plan)

    return NextResponse.json({
      plan,
      from_cache: false,
    })
  } catch (error) {
    console.error('Error generating optimized plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimized plan' },
      { status: 500 }
    )
  }
}
