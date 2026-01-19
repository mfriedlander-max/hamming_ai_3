// Social feature types

export type FriendshipStatus = 'pending' | 'accepted' | 'declined'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface Friend {
  id: string
  user_id: string
  name: string | null
  email?: string | null  // Email not available from profiles table
  friends_since: string
}

export interface FriendRequest {
  id: string
  requester_id: string
  requester_name: string | null
  requester_email?: string | null  // Email not available from profiles table
  created_at: string
}

export type ActivityAction = 'subscribed' | 'paused' | 'resumed' | 'cancelled'

export interface ActivityItem {
  id: string
  user_id: string
  user_name: string | null
  action: ActivityAction
  service_id: string
  service_name: string
  service_logo: string | null
  created_at: string
}

export interface Watchlist {
  id: string
  name: string
  created_by: string | null
  created_at: string
  member_count?: number
  item_count?: number
}

export type WatchlistRole = 'owner' | 'editor' | 'viewer'

export interface WatchlistMember {
  watchlist_id: string
  user_id: string
  role: WatchlistRole
  joined_at: string
  user_name?: string | null
  user_email?: string
}

export type ContentType = 'movie' | 'tv'

export interface WatchlistItem {
  id: string
  watchlist_id: string
  tmdb_id: number
  content_type: ContentType
  title: string
  poster_path: string | null
  added_by: string | null
  added_at: string
  added_by_name?: string | null
}

export interface WatchlistWithDetails extends Watchlist {
  members: WatchlistMember[]
  items: WatchlistItem[]
}

// API Response types
export interface FriendsResponse {
  friends: Friend[]
  pending_requests: FriendRequest[]
}

export interface ActivityResponse {
  activities: ActivityItem[]
  has_more: boolean
}

export interface WatchlistsResponse {
  watchlists: Watchlist[]
}
