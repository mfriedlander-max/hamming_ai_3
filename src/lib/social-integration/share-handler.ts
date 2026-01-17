import { createClient } from '@/lib/supabase/server'
import type { ShareContentInput, FriendShare } from './types'

/**
 * Share content with a friend - creates a notification
 */
export async function shareContentWithFriend(
  senderId: string,
  input: ShareContentInput
): Promise<void> {
  const supabase = await createClient()

  // Verify they are friends (accepted friendship)
  const { data: friendships, error: friendshipError } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(
      `and(requester_id.eq.${senderId},addressee_id.eq.${input.recipient_id}),and(requester_id.eq.${input.recipient_id},addressee_id.eq.${senderId})`
    )
    .eq('status', 'accepted')

  if (friendshipError || !friendships || friendships.length === 0) {
    throw new Error('Cannot share with non-friend')
  }

  // Get sender's name
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', senderId)
    .single()

  const senderName = senderProfile?.name || 'A friend'

  // Create notification for the recipient
  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: input.recipient_id,
    type: 'friend_share',
    title: `${senderName} shared a ${input.content_type}`,
    body: input.title,
    data: {
      sender_id: senderId,
      sender_name: senderName,
      tmdb_id: input.tmdb_id,
      content_type: input.content_type,
      title: input.title,
      poster_path: input.poster_path,
      message: input.message,
    },
  })

  if (notifError) {
    throw new Error(`Failed to create share notification: ${notifError.message}`)
  }
}

/**
 * Get content shares received by a user
 */
export async function getSharesReceivedByUser(
  userId: string
): Promise<FriendShare[]> {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, data, created_at')
    .eq('user_id', userId)
    .eq('type', 'friend_share')
    .order('created_at', { ascending: false })

  if (error || !notifications) {
    return []
  }

  // Convert notifications to FriendShare format
  return notifications.map((notif) => {
    const data = notif.data as {
      sender_id: string
      sender_name: string
      tmdb_id: number
      content_type: 'movie' | 'tv'
      title: string
      poster_path?: string
      message?: string
    }

    return {
      id: notif.id,
      sender_id: data.sender_id,
      sender_name: data.sender_name,
      recipient_id: notif.user_id,
      tmdb_id: data.tmdb_id,
      content_type: data.content_type,
      title: data.title,
      poster_path: data.poster_path || null,
      message: data.message || null,
      shared_at: notif.created_at,
    }
  })
}

/**
 * Add a shared content item to the user's watchlist
 */
export async function addShareToQueue(
  userId: string,
  shareId: string
): Promise<void> {
  const supabase = await createClient()

  // Get the share notification
  const { data: notification, error: notifError } = await supabase
    .from('notifications')
    .select('id, data')
    .eq('id', shareId)
    .single()

  if (notifError || !notification) {
    throw new Error('Share not found')
  }

  const shareData = notification.data as {
    sender_id: string
    sender_name: string
    tmdb_id: number
    content_type: 'movie' | 'tv'
    title: string
    poster_path?: string
  }

  // Find or create a watchlist for the user (use their first watchlist or create one)
  let watchlistId: string

  const { data: existingWatchlists } = await supabase
    .from('watchlist_members')
    .select('watchlist_id')
    .eq('user_id', userId)

  if (existingWatchlists && existingWatchlists.length > 0) {
    watchlistId = existingWatchlists[0].watchlist_id
  } else {
    // Create a default watchlist
    const { data: newWatchlist, error: createError } = await supabase
      .from('watchlists')
      .insert({ name: 'My Watchlist', created_by: userId })
      .select('id')
      .single()

    if (createError || !newWatchlist) {
      throw new Error('Failed to create watchlist')
    }

    watchlistId = newWatchlist.id

    // Add user as owner
    await supabase.from('watchlist_members').insert({
      watchlist_id: watchlistId,
      user_id: userId,
      role: 'owner',
    })
  }

  // Add the content to the watchlist with friend_share source info
  const { error: insertError } = await supabase.from('watchlist_items').insert({
    watchlist_id: watchlistId,
    tmdb_id: shareData.tmdb_id,
    content_type: shareData.content_type,
    title: shareData.title,
    poster_path: shareData.poster_path,
    added_by: userId,
  })

  if (insertError) {
    // Ignore duplicate errors (content already in watchlist)
    if (!insertError.message.includes('duplicate')) {
      throw new Error(`Failed to add to queue: ${insertError.message}`)
    }
  }
}
