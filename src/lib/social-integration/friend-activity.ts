import { createClient } from '@/lib/supabase/server'
import type { FriendActivityItem, FriendsWatchingMap } from './types'

/**
 * Base release type constraint for enrichment function
 */
interface BaseRelease {
  id: string
  tmdb_id?: number
}

interface FriendshipWithProfile {
  requester_id: string
  addressee_id: string
  status: string
  requester?: { id: string; name: string | null }
  addressee?: { id: string; name: string | null }
}

/**
 * Get all friend activity (what friends have in their watchlists)
 */
export async function getFriendsActivity(
  userId: string
): Promise<FriendActivityItem[]> {
  const supabase = await createClient()

  // Get accepted friendships
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select(
      `
      requester_id,
      addressee_id,
      status,
      requester:profiles!friendships_requester_id_fkey(id, name),
      addressee:profiles!friendships_addressee_id_fkey(id, name)
    `
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (friendshipsError || !friendships || friendships.length === 0) {
    return []
  }

  // Extract friend IDs and names
  const friendsMap = new Map<string, string>()
  for (const fs of friendships as unknown as FriendshipWithProfile[]) {
    if (fs.requester_id === userId && fs.addressee) {
      friendsMap.set(fs.addressee.id, fs.addressee.name || 'Unknown')
    } else if (fs.addressee_id === userId && fs.requester) {
      friendsMap.set(fs.requester.id, fs.requester.name || 'Unknown')
    }
  }

  if (friendsMap.size === 0) {
    return []
  }

  const friendIds = Array.from(friendsMap.keys())

  // Get watchlist items from friends
  const { data: watchlistItems, error: itemsError } = await supabase
    .from('watchlist_items')
    .select(
      `
      added_by,
      tmdb_id,
      content_type,
      profiles:profiles!watchlist_items_added_by_fkey(name)
    `
    )
    .in('added_by', friendIds)

  if (itemsError || !watchlistItems) {
    return []
  }

  // Convert to FriendActivityItem
  return watchlistItems.map((item) => ({
    friend_id: item.added_by,
    friend_name:
      (item.profiles as unknown as { name: string | null })?.name || 'Unknown',
    tmdb_id: item.tmdb_id,
    content_type: item.content_type as 'movie' | 'tv',
    activity_type: 'queued' as const,
  }))
}

/**
 * Get map of which friends are watching which content
 */
export async function getFriendsWatchingContent(
  userId: string,
  tmdbIds: number[]
): Promise<FriendsWatchingMap> {
  if (tmdbIds.length === 0) {
    return {}
  }

  const supabase = await createClient()

  // Get accepted friendships
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select(
      `
      requester_id,
      addressee_id,
      status,
      requester:profiles!friendships_requester_id_fkey(id, name),
      addressee:profiles!friendships_addressee_id_fkey(id, name)
    `
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (friendshipsError || !friendships || friendships.length === 0) {
    return {}
  }

  // Extract friend IDs and names
  const friendsMap = new Map<string, string>()
  for (const fs of friendships as unknown as FriendshipWithProfile[]) {
    if (fs.requester_id === userId && fs.addressee) {
      friendsMap.set(fs.addressee.id, fs.addressee.name || 'Unknown')
    } else if (fs.addressee_id === userId && fs.requester) {
      friendsMap.set(fs.requester.id, fs.requester.name || 'Unknown')
    }
  }

  if (friendsMap.size === 0) {
    return {}
  }

  const friendIds = Array.from(friendsMap.keys())

  // Get watchlist items that match our tmdb_ids
  const { data: watchlistItems, error: itemsError } = await supabase
    .from('watchlist_items')
    .select(
      `
      added_by,
      tmdb_id,
      profiles:profiles!watchlist_items_added_by_fkey(name)
    `
    )
    .in('added_by', friendIds)
    .in('tmdb_id', tmdbIds)

  if (itemsError || !watchlistItems) {
    return {}
  }

  // Build the map
  const result: FriendsWatchingMap = {}
  for (const item of watchlistItems) {
    const friendName =
      (item.profiles as unknown as { name: string | null })?.name || 'Unknown'

    if (!result[item.tmdb_id]) {
      result[item.tmdb_id] = {
        friend_ids: [],
        friend_names: [],
      }
    }

    result[item.tmdb_id].friend_ids.push(item.added_by)
    result[item.tmdb_id].friend_names.push(friendName)
  }

  return result
}

/**
 * Enrich content releases with friend_watching flag
 * Generic function that works with both calendar and optimizer ContentRelease types
 */
export async function enrichReleasesWithFriendActivity<T extends BaseRelease>(
  releases: T[],
  userId: string
): Promise<(T & { friend_watching: boolean })[]> {
  if (releases.length === 0) {
    return releases.map((r) => ({ ...r, friend_watching: false }))
  }

  // Extract tmdb_ids from releases (need to handle string ids)
  const tmdbIds = releases
    .map((r) => {
      // The id might be the tmdb_id or we might have a tmdb_id field
      if (r.tmdb_id) return r.tmdb_id
      // Try parsing the id as a number
      const parsed = parseInt(r.id, 10)
      return isNaN(parsed) ? null : parsed
    })
    .filter((id): id is number => id !== null)

  if (tmdbIds.length === 0) {
    return releases.map((r) => ({ ...r, friend_watching: false }))
  }

  const friendsWatching = await getFriendsWatchingContent(userId, tmdbIds)

  return releases.map((release) => {
    const id = release.tmdb_id || parseInt(release.id, 10)

    return {
      ...release,
      friend_watching: !isNaN(id) && !!friendsWatching[id],
    }
  })
}
