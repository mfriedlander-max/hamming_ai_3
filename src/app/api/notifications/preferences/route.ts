import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NotificationPreferences } from '@/lib/notifications/types'

const DEFAULT_PREFERENCES = {
  content_release: true,
  pause_suggestion: true,
  resubscribe_reminder: true,
  price_change: true,
}

export async function GET(): Promise<NextResponse<NotificationPreferences | { error: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }

  // If no preferences exist, create defaults
  if (!data) {
    const { data: newPrefs, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        ...DEFAULT_PREFERENCES,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating default preferences:', insertError)
      return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
    }

    return NextResponse.json(newPrefs as NotificationPreferences)
  }

  return NextResponse.json(data as NotificationPreferences)
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Only allow updating valid preference fields
  const validFields = ['content_release', 'pause_suggestion', 'resubscribe_reminder', 'price_change']
  const updates: Record<string, boolean> = {}

  for (const field of validFields) {
    if (typeof body[field] === 'boolean') {
      updates[field] = body[field]
    }
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...DEFAULT_PREFERENCES,
      ...updates,
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }

  return NextResponse.json(data)
}
