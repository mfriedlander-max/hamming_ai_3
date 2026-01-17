import { createClient } from '@/lib/supabase/server'
import type { SpoilerAlert } from './types'

interface FriendshipWithProfile {
  requester_id: string
  addressee_id: string
  status: string
  requester?: { id: string; name: string | null }
  addressee?: { id: string; name: string | null }
}

/**
 * Check for spoiler risks - friends who are ahead or behind on TV shows
 */
export async function checkSpoilerRisks(
  userId: string,
  tmdbIds: number[]
): Promise<SpoilerAlert[]> {
  if (tmdbIds.length === 0) {
    return []
  }

  const supabase = await createClient()

  // Get user's accepted friendships
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

  // Build friend map
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

  // Get user's watch progress (stored in activity_feed with watch_progress type)
  const { data: userProgress } = await supabase
    .from('activity_feed')
    .select('user_id, data')
    .eq('user_id', userId)
    .eq('action', 'watch_progress')
    .in('data->>tmdb_id', tmdbIds.map(String))

  // Parse user's progress
  const userProgressMap = new Map<number, number>()
  for (const p of userProgress || []) {
    const data = p.data as { tmdb_id?: number; episodes_watched?: number }
    if (data?.tmdb_id && data?.episodes_watched !== undefined) {
      userProgressMap.set(data.tmdb_id, data.episodes_watched)
    }
  }

  // Get friends' watch progress
  const { data: friendsProgress } = await supabase
    .from('activity_feed')
    .select('user_id, data')
    .in('user_id', friendIds)
    .eq('action', 'watch_progress')
    .in('data->>tmdb_id', tmdbIds.map(String))

  // Build alerts
  const alerts: SpoilerAlert[] = []

  for (const fp of friendsProgress || []) {
    const data = fp.data as { tmdb_id?: number; episodes_watched?: number; title?: string }
    if (!data?.tmdb_id || data.episodes_watched === undefined) continue

    const userEpisodes = userProgressMap.get(data.tmdb_id) || 0
    const friendEpisodes = data.episodes_watched

    // Only alert if there's a difference
    if (friendEpisodes === userEpisodes) continue

    const friendName = friendsMap.get(fp.user_id) || 'Unknown'

    alerts.push({
      tmdb_id: data.tmdb_id,
      title: data.title || 'Unknown Show',
      friend_id: fp.user_id,
      friend_name: friendName,
      friend_position: friendEpisodes > userEpisodes ? 'ahead' : 'behind',
      episode_difference: Math.abs(friendEpisodes - userEpisodes),
    })
  }

  return alerts
}
