import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivityResponse, ActivityItem } from '@/lib/social/types'

const DEFAULT_LIMIT = 20

export async function GET(request: Request): Promise<NextResponse<ActivityResponse | { error: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  // Fetch one extra to check if there are more
  const { data, error } = await supabase
    .from('activity_feed')
    .select(
      `
      id,
      user_id,
      action,
      service_id,
      created_at,
      profile:profiles!activity_feed_user_id_fkey(id, name),
      service:services!activity_feed_service_id_fkey(id, name, logo_path)
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)

  if (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 })
  }

  const has_more = data.length > limit
  const activities: ActivityItem[] = data.slice(0, limit).map((item) => {
    // Supabase returns joined tables as arrays
    const profileArr = item.profile as { id: string; name: string | null }[] | null
    const serviceArr = item.service as { id: string; name: string; logo_path: string | null }[] | null
    const profile = Array.isArray(profileArr) ? profileArr[0] : profileArr
    const service = Array.isArray(serviceArr) ? serviceArr[0] : serviceArr

    return {
      id: item.id,
      user_id: item.user_id,
      user_name: profile?.name || null,
      action: item.action,
      service_id: item.service_id,
      service_name: service?.name || 'Unknown Service',
      service_logo: service?.logo_path || null,
      created_at: item.created_at,
    }
  })

  return NextResponse.json({ activities, has_more })
}
