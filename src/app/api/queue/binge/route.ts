import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTMDBClient } from '@/lib/tmdb/client'

interface BingeRequest {
  tmdb_id: number
  title: string
  service_id: string
  service_name: string
  poster_path?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as BingeRequest

  // Validate required fields
  if (!body.tmdb_id || !body.title || !body.service_id || !body.service_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get user's watch speed preference
  const { data: profile } = await supabase
    .from('profiles')
    .select('watch_speed')
    .eq('id', user.id)
    .single()

  const watchSpeed = profile?.watch_speed ?? 2 // Default 2 episodes per day

  // Get show details from TMDB
  const tmdbApiKey = process.env.TMDB_API_KEY
  if (!tmdbApiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
  }
  const tmdbClient = createTMDBClient(tmdbApiKey)
  const showDetails = await tmdbClient.getShowDetails(body.tmdb_id)
  const totalEpisodes = showDetails.number_of_episodes || 1
  const episodeRuntime = showDetails.episode_run_time?.[0] || 45

  // Calculate binge plan
  const daysToComplete = Math.ceil(totalEpisodes / watchSpeed)
  const totalDuration = totalEpisodes * episodeRuntime

  const deadline = new Date()
  deadline.setDate(deadline.getDate() + daysToComplete)
  const deadlineStr = deadline.toISOString().split('T')[0]

  // Get next priority
  const { data: existingItems } = await supabase
    .from('queue_items')
    .select('priority')
    .eq('user_id', user.id)
    .order('priority', { ascending: false })

  const nextPriority = existingItems && existingItems.length > 0
    ? (existingItems[0].priority as number) + 1
    : 1

  // Create queue item
  const { data: item, error } = await supabase
    .from('queue_items')
    .insert({
      user_id: user.id,
      tmdb_id: body.tmdb_id,
      title: body.title,
      content_type: 'tv',
      service_id: body.service_id,
      service_name: body.service_name,
      poster_path: body.poster_path || null,
      duration_minutes: totalDuration,
      priority: nextPriority,
      source: 'binge_plan',
      deadline: deadlineStr,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    item,
    binge_plan: {
      total_episodes: totalEpisodes,
      episode_runtime: episodeRuntime,
      days_to_complete: daysToComplete,
      deadline: deadlineStr,
      watch_speed: watchSpeed,
    },
  }, { status: 201 })
}
