/**
 * Queue Manager
 *
 * Manages queue health by detecting overloaded queues
 * and suggesting items to remove to fit available watch time.
 */

import { createClient } from '@/lib/supabase/server'
import type { QueueItem } from '@/lib/queue/types'
import type { QueueHealth } from './types'

const DEFAULT_WATCH_HOURS_PER_WEEK = 10
const WARNING_THRESHOLD = 0.8 // 80% of capacity

/**
 * Convert minutes to hours
 */
function minutesToHours(minutes: number): number {
  return minutes / 60
}

/**
 * Calculate days until a deadline
 */
function daysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / msPerDay)
}

/**
 * Check queue health for a user
 */
export async function checkQueueHealth(userId: string): Promise<QueueHealth> {
  const supabase = await createClient()

  // Get user's queue items
  const { data: queueItems } = await supabase
    .from('queue_items')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: true })

  // Get user's available watch time
  const { data: behaviorPattern } = await supabase
    .from('user_behavior_patterns')
    .select('avg_watch_hours_per_week')
    .eq('user_id', userId)
    .single()

  const items = queueItems ?? []
  const availableHours = behaviorPattern?.avg_watch_hours_per_week ?? DEFAULT_WATCH_HOURS_PER_WEEK

  // Calculate total hours needed
  const totalMinutes = items.reduce((sum, item) => sum + item.duration_minutes, 0)
  const totalHoursNeeded = minutesToHours(totalMinutes)

  // Calculate deficit
  const hoursDeficit = Math.max(0, totalHoursNeeded - availableHours)

  // Determine status
  let status: 'healthy' | 'overloaded' | 'warning' = 'healthy'
  if (totalHoursNeeded > availableHours) {
    status = 'overloaded'
  } else if (totalHoursNeeded > availableHours * WARNING_THRESHOLD) {
    status = 'warning'
  }

  // Find items to remove if overloaded
  const itemsToRemove = status === 'overloaded'
    ? getItemsToRemoveForCapacity(items, hoursDeficit)
    : undefined

  // Check for deadline conflicts
  const deadlineConflicts = hasDeadlineConflicts(items, availableHours)

  return {
    status,
    total_hours_needed: totalHoursNeeded,
    available_hours: availableHours,
    hours_deficit: hoursDeficit,
    items_to_remove: itemsToRemove,
    deadline_conflicts: deadlineConflicts.length > 0 ? deadlineConflicts : undefined,
  }
}

/**
 * Get items to remove to fit within capacity, prioritizing lowest priority items
 */
export function getItemsToRemoveForCapacity(
  queueItems: QueueItem[],
  hoursToFree: number
): QueueItem[] {
  // Sort by priority descending (highest priority number = lowest priority)
  const sortedByLowestPriority = [...queueItems].sort((a, b) => b.priority - a.priority)

  const itemsToRemove: QueueItem[] = []
  let freedHours = 0

  for (const item of sortedByLowestPriority) {
    if (freedHours >= hoursToFree) break

    itemsToRemove.push(item)
    freedHours += minutesToHours(item.duration_minutes)
  }

  return itemsToRemove
}

/**
 * Check for items with deadlines that can't be met with available time
 */
export function hasDeadlineConflicts(
  queueItems: QueueItem[],
  availableHoursPerWeek: number
): string[] {
  const conflicts: string[] = []
  const hoursPerDay = availableHoursPerWeek / 7

  for (const item of queueItems) {
    if (!item.deadline) continue

    const daysAvailable = daysUntilDeadline(item.deadline)
    if (daysAvailable <= 0) {
      // Deadline already passed
      conflicts.push(item.title)
      continue
    }

    const hoursAvailableUntilDeadline = daysAvailable * hoursPerDay
    const hoursNeeded = minutesToHours(item.duration_minutes)

    if (hoursNeeded > hoursAvailableUntilDeadline) {
      conflicts.push(item.title)
    }
  }

  return conflicts
}
