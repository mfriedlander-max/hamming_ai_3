/**
 * Calendar Unified Action Handlers
 *
 * Client-side functions for one-tap actions on the unified calendar page.
 * All functions call the appropriate API endpoints and handle errors.
 */

interface ReleaseData {
  id: string
  tmdb_id: number
  title: string
  content_type: 'movie' | 'tv'
  service_id: string
  service_name: string
  duration_minutes: number
  poster_path?: string
}

interface BingeShowData {
  tmdb_id: number
  title: string
  service_id: string
  service_name: string
  poster_path?: string
}

interface QueueReorderItem {
  id: string
  priority: number
}

async function apiCall<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data as T
}

/**
 * Add a release to the watch queue
 */
export async function addToQueue(release: ReleaseData) {
  return apiCall<{ item: unknown }>('/api/calendar/actions', {
    action: 'add_to_queue',
    release,
  })
}

/**
 * Remove an item from the watch queue
 */
export async function removeFromQueue(queueItemId: string) {
  return apiCall<{ success: boolean }>('/api/calendar/actions', {
    action: 'remove_from_queue',
    queue_item_id: queueItemId,
  })
}

/**
 * Plan a binge for a TV show
 */
export async function planBinge(show: BingeShowData) {
  return apiCall<{
    item: unknown
    binge_plan: {
      total_episodes: number
      episode_runtime: number
      days_to_complete: number
      deadline: string
      watch_speed: number
    }
  }>('/api/queue/binge', show)
}

/**
 * Create a watch-together session with friends
 */
export async function watchTogether(queueItemId: string, friendIds: string[], scheduledDate?: string, message?: string) {
  return apiCall<{
    session: {
      id: string
      queue_item_id: string
      organizer_id: string
      participant_ids: string[]
      status: string
    }
  }>('/api/queue/watch-together', {
    queue_item_id: queueItemId,
    friend_ids: friendIds,
    scheduled_date: scheduledDate,
    message: message,
  })
}

/**
 * Set a reminder for a release date
 */
export async function setReminder(releaseDate: string, serviceId: string) {
  return apiCall<{ reminder: { id: string } }>('/api/calendar/actions', {
    action: 'set_reminder',
    release_date: releaseDate,
    service_id: serviceId,
  })
}

/**
 * Apply all optimizer actions (create reminders, update subscriptions)
 */
export async function applyAllActions() {
  return apiCall<{ message: string; actions_applied: number }>('/api/calendar/actions', {
    action: 'apply_all',
  })
}

/**
 * Regenerate the optimizer plan
 */
export async function regeneratePlan() {
  return apiCall<{ message: string }>('/api/calendar/actions', {
    action: 'regenerate',
  })
}

/**
 * Reorder queue items (for drag-and-drop)
 */
export async function reorderQueue(items: QueueReorderItem[]) {
  return apiCall<{ success: boolean }>('/api/queue/reorder', {
    items,
  })
}
