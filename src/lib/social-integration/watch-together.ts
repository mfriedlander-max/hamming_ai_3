import { createClient } from '@/lib/supabase/server'
import type { WatchTogetherInput, WatchTogetherSession } from './types'

/**
 * Create a watch-together session with friends
 */
export async function createWatchTogetherSession(
  input: WatchTogetherInput,
  organizerId: string
): Promise<WatchTogetherSession> {
  const supabase = await createClient()

  // Verify all participants are friends with the organizer
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(
      input.friend_ids
        .map(
          (fid) =>
            `and(requester_id.eq.${organizerId},addressee_id.eq.${fid}),and(requester_id.eq.${fid},addressee_id.eq.${organizerId})`
        )
        .join(',')
    )
    .eq('status', 'accepted')

  if (friendshipsError) {
    throw new Error('Failed to verify friendships')
  }

  // Check that we found friendships for all requested participants
  const friendIdSet = new Set<string>()
  for (const fs of friendships || []) {
    if (fs.requester_id === organizerId) {
      friendIdSet.add(fs.addressee_id)
    } else {
      friendIdSet.add(fs.requester_id)
    }
  }

  const missingFriends = input.friend_ids.filter((id) => !friendIdSet.has(id))
  if (missingFriends.length > 0) {
    throw new Error('Not all participants are friends')
  }

  // Get organizer profile
  const { data: organizerProfile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', organizerId)
    .single()

  const organizerName = organizerProfile?.name || 'Someone'

  // Get participant profiles
  const { data: participantProfiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', input.friend_ids)

  const participantNames = input.friend_ids.map((id) => {
    const profile = participantProfiles?.find((p) => p.id === id)
    return profile?.name || 'Unknown'
  })

  // Create the session in notifications with special type
  // We'll use notifications table since watch_together_sessions may not exist
  const sessionData = {
    id: crypto.randomUUID(),
    queue_item_id: input.queue_item_id,
    organizer_id: organizerId,
    organizer_name: organizerName,
    participant_ids: input.friend_ids,
    participant_names: participantNames,
    scheduled_date: input.scheduled_date || null,
    message: input.message || null,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  }

  // Store session data via notification
  const { error: insertError } = await supabase.from('notifications').insert(
    input.friend_ids.map((friendId) => ({
      user_id: friendId,
      type: 'watch_together_invite',
      title: `${organizerName} wants to watch together`,
      body: input.message || 'Join the watch party!',
      data: sessionData,
    }))
  )

  if (insertError) {
    throw new Error(`Failed to create session: ${insertError.message}`)
  }

  return sessionData
}

/**
 * Get watch-together sessions for a user
 */
export async function getSessionsForUser(
  userId: string
): Promise<WatchTogetherSession[]> {
  const supabase = await createClient()

  // Get notifications of type watch_together_invite where user is participant or organizer
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, data, created_at')
    .eq('type', 'watch_together_invite')
    .or(`user_id.eq.${userId},data->>organizer_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error || !notifications) {
    return []
  }

  // Extract unique sessions (may have multiple notifications for same session)
  const sessionsMap = new Map<string, WatchTogetherSession>()

  for (const notif of notifications) {
    const data = notif.data as WatchTogetherSession
    if (data && data.id && !sessionsMap.has(data.id)) {
      sessionsMap.set(data.id, data)
    }
  }

  // Get all user IDs involved for name lookup
  const allUserIds = new Set<string>()
  for (const session of sessionsMap.values()) {
    allUserIds.add(session.organizer_id)
    session.participant_ids.forEach((id) => allUserIds.add(id))
  }

  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', Array.from(allUserIds))

  const profileMap = new Map(profiles?.map((p) => [p.id, p.name || 'Unknown']) || [])

  // Enrich sessions with names
  return Array.from(sessionsMap.values()).map((session) => ({
    ...session,
    organizer_name: profileMap.get(session.organizer_id) || session.organizer_name,
    participant_names: session.participant_ids.map(
      (id) => profileMap.get(id) || 'Unknown'
    ),
  }))
}

/**
 * Respond to a watch-together session invitation
 */
export async function respondToSession(
  userId: string,
  sessionId: string,
  accept: boolean
): Promise<void> {
  const supabase = await createClient()

  // Find the notification for this session and user
  const { data: notifications, error: findError } = await supabase
    .from('notifications')
    .select('id, data')
    .eq('user_id', userId)
    .eq('type', 'watch_together_invite')

  if (findError || !notifications) {
    throw new Error('Session not found')
  }

  // Find the notification with matching session ID
  const notification = notifications.find((n) => {
    const data = n.data as WatchTogetherSession
    return data?.id === sessionId
  })

  if (!notification) {
    throw new Error('Session not found')
  }

  // Update the notification data with response
  const sessionData = notification.data as WatchTogetherSession
  const newStatus = accept ? 'confirmed' : 'cancelled'

  const { error: updateError } = await supabase
    .from('notifications')
    .update({
      data: { ...sessionData, status: newStatus },
      read: true,
    })
    .eq('id', notification.id)

  if (updateError) {
    throw new Error(`Failed to respond to session: ${updateError.message}`)
  }
}
