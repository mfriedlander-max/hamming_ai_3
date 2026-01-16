/**
 * Queue Types
 *
 * Types for the watch queue API - manages user's prioritized content queue
 * that powers the unified calendar's Watch Queue section.
 */

export type QueueItemSource = 'watchlist' | 'friend_share' | 'taste_match' | 'binge_plan' | 'manual'

export interface QueueItem {
  id: string
  user_id: string
  tmdb_id: number
  title: string
  content_type: 'movie' | 'tv'
  service_id: string
  service_name: string
  poster_path: string | null
  duration_minutes: number
  priority: number
  source: QueueItemSource
  deadline: string | null
  added_at: string
}

export interface CreateQueueItemInput {
  tmdb_id: number
  title: string
  content_type: 'movie' | 'tv'
  service_id: string
  service_name: string
  poster_path?: string | null
  duration_minutes: number
  priority?: number
  source?: QueueItemSource
  deadline?: string | null
}

export interface UpdateQueueItemInput {
  priority?: number
  deadline?: string | null
}

export interface QueueResponse {
  items: QueueItem[]
  total: number
}
