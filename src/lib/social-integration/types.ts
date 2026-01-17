/**
 * Social Integration Types
 * Types for friend activity, sharing, watch-together, and spoiler alerts
 */

// Friend activity tracking
export interface FriendActivityItem {
  friend_id: string
  friend_name: string
  tmdb_id: number
  content_type: 'movie' | 'tv'
  activity_type: 'queued' | 'watching' | 'completed'
}

// Map of tmdb_id to friends watching that content
export interface FriendsWatchingMap {
  [tmdb_id: number]: {
    friend_ids: string[]
    friend_names: string[]
  }
}

// Input for sharing content with a friend
export interface ShareContentInput {
  recipient_id: string
  tmdb_id: number
  content_type: 'movie' | 'tv'
  title: string
  poster_path?: string
  message?: string
}

// Friend share record from database
export interface FriendShare {
  id: string
  sender_id: string
  sender_name: string
  recipient_id: string
  tmdb_id: number
  content_type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  message: string | null
  shared_at: string
}

// Input for creating a watch-together session
export interface WatchTogetherInput {
  queue_item_id: string
  friend_ids: string[]
  scheduled_date?: string
  message?: string
}

// Watch-together session record
export interface WatchTogetherSession {
  id: string
  queue_item_id: string
  organizer_id: string
  organizer_name: string
  participant_ids: string[]
  participant_names: string[]
  scheduled_date: string | null
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

// Spoiler alert for content a friend is ahead on
export interface SpoilerAlert {
  tmdb_id: number
  title: string
  friend_id: string
  friend_name: string
  friend_position: 'ahead' | 'behind'
  episode_difference?: number
}

// Friend info for UI display
export interface FriendInfo {
  id: string
  name: string
  email?: string
}
