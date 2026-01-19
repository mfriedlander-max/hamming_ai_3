import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOptimizedPlan } from '@/lib/optimizer-v2/optimizer'
import { shouldRecalculate } from '@/lib/optimizer-v2/recalculator'
import {
  toCalendarPlan,
  type OptimizerInputs,
  type OptimizedPlan,
  type UserSubscription,
  type WatchlistItemInput,
  type FriendShareInput,
  type BingePlanInput,
  type ContentReleaseInput,
  type CalendarWatchSlot,
  type CalendarOptimizedPlan,
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

  // Fetch content releases: past 30 days (recently released, still watchable) + next 90 days
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 30)  // Include recent past content
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + 90)

  const serviceIds = transformedSubscriptions.map((s) => s.service_id)

  const { data: content } = await supabase
    .from('content')
    .select(
      'tmdb_id, title, type, release_date, genres, service_id, poster_url'
    )
    .gte('release_date', startDate.toISOString().split('T')[0])
    .lte('release_date', endDate.toISOString().split('T')[0])
    .in('service_id', serviceIds)

  const transformedContent: ContentReleaseInput[] = (content || []).map(
    (item) => ({
      tmdb_id: item.tmdb_id,
      title: item.title,
      type: item.type as 'movie' | 'tv',
      release_date: item.release_date,
      genres: item.genres || [],
      service_ids: [item.service_id],  // Wrap single FK in array for type compatibility
      poster_path: item.poster_url,  // Map poster_url to poster_path for type compatibility
      runtime_minutes: item.type === 'movie' ? 120 : 45,  // Default runtimes (not in table)
      episode_count: item.type === 'tv' ? 10 : undefined,  // Default episodes (not in table)
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
 * Fetch user's queue items from the database
 */
async function fetchQueueItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<CalendarWatchSlot[]> {
  const { data: queueItems } = await supabase
    .from('queue_items')
    .select('id, tmdb_id, title, service_id, service_name, content_type, poster_path, duration_minutes, priority, source, deadline')
    .eq('user_id', userId)
    .order('priority', { ascending: true })

  return (queueItems || []).map((item) => ({
    intent_id: item.id,
    title: item.title,
    service_id: item.service_id,
    service_name: item.service_name,
    scheduled_date: '', // User-added items don't have scheduled dates yet
    duration_minutes: item.duration_minutes || 120,
    priority_score: 100 - (item.priority || 1), // Higher priority items come first
    source: item.source || 'manual',
    deadline: item.deadline,
    poster_path: item.poster_path,
  }))
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

interface CalendarOptimizeResponse {
  plan: CalendarOptimizedPlan
  from_cache: boolean
}

export async function POST(request: Request): Promise<NextResponse<CalendarOptimizeResponse | { error: string }>> {
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

    let rawPlan: OptimizedPlan
    let fromCache = false

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = await getCachedPlan(supabase, user.id)
      if (cached && !shouldRecalculate(inputs, cached.plan)) {
        rawPlan = cached.plan
        fromCache = true
      } else {
        // Generate new plan
        rawPlan = generateOptimizedPlan(inputs)
        // Save to cache
        await savePlanToCache(supabase, user.id, rawPlan)
      }
    } else {
      // Generate new plan
      rawPlan = generateOptimizedPlan(inputs)
      // Save to cache
      await savePlanToCache(supabase, user.id, rawPlan)
    }

    // Convert to CalendarOptimizedPlan format
    const calendarPlan = toCalendarPlan(rawPlan, inputs.subscriptions)

    // Fetch user's queue items and merge into watch_queue
    const queueItems = await fetchQueueItems(supabase, user.id)

    // Queue items take priority - they're what the user explicitly added
    // Merge: queue items first, then optimizer suggestions that aren't duplicates
    const queueTitles = new Set(queueItems.map(item => item.title.toLowerCase()))
    const optimizerItems = calendarPlan.watch_queue.filter(
      item => !queueTitles.has(item.title.toLowerCase())
    )

    const finalPlan: CalendarOptimizedPlan = {
      ...calendarPlan,
      watch_queue: [...queueItems, ...optimizerItems],
    }

    return NextResponse.json({
      plan: finalPlan,
      from_cache: fromCache,
    })
  } catch (error) {
    console.error('Error generating optimized plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimized plan' },
      { status: 500 }
    )
  }
}
