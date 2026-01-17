/**
 * Content Monitor
 *
 * Detects changes in TMDB content data for queued items:
 * - Release date changes
 * - Content removed from TMDB
 * - Show cancellation status
 */

import { createTMDBClient } from '@/lib/tmdb/client'
import type { QueueItem } from '@/lib/queue/types'
import type { ContentChange, ContentMonitorResult } from './types'

interface DetectContentChangesOptions {
  tmdbApiKey: string
  storedReleaseDates?: Record<number, string>
  storedStatuses?: Record<number, string>
}

/**
 * Detect content changes for queued items by comparing stored data with TMDB
 */
export async function detectContentChanges(
  queueItems: QueueItem[],
  options: DetectContentChangesOptions
): Promise<ContentMonitorResult> {
  const changes: ContentChange[] = []
  let checkedCount = 0
  let errorCount = 0

  const client = createTMDBClient(options.tmdbApiKey)
  const now = new Date().toISOString()

  for (const item of queueItems) {
    checkedCount++

    try {
      if (item.content_type === 'tv') {
        // For TV shows, fetch details from TMDB
        const details = await client.getShowDetails(item.tmdb_id)

        // Check for date change
        const storedDate = options.storedReleaseDates?.[item.tmdb_id]
        if (storedDate && details.first_air_date !== storedDate) {
          changes.push({
            queue_item_id: item.id,
            tmdb_id: item.tmdb_id,
            title: item.title,
            change_type: 'date_changed',
            old_value: storedDate,
            new_value: details.first_air_date,
            detected_at: now,
          })
        }

        // Check for cancellation
        const storedStatus = options.storedStatuses?.[item.tmdb_id]
        if (storedStatus && details.status === 'Canceled' && storedStatus !== 'Canceled') {
          changes.push({
            queue_item_id: item.id,
            tmdb_id: item.tmdb_id,
            title: item.title,
            change_type: 'cancelled',
            old_value: storedStatus,
            new_value: details.status,
            detected_at: now,
          })
        }
      } else {
        // For movies, we would use a different API endpoint
        // For now, just mark as checked
        // In a full implementation, we'd call getMovieDetails
      }
    } catch (error) {
      // Check if this is a 404 (content removed)
      if (error instanceof Error && error.message.includes('404')) {
        changes.push({
          queue_item_id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          change_type: 'removed',
          detected_at: now,
        })
      } else {
        // Other errors - log but don't add as change
        errorCount++
      }
    }
  }

  return {
    changes,
    checked_count: checkedCount,
    error_count: errorCount,
  }
}

/**
 * Handle a detected content change by creating notifications
 */
export async function handleContentChange(
  change: ContentChange,
  userId: string
): Promise<void> {
  // Create notification for the user about the content change
  // In a full implementation, this would call the notifications API
  // For now, just log the change (no-op for test)
  console.log(`Content change detected for user ${userId}:`, change)
}
