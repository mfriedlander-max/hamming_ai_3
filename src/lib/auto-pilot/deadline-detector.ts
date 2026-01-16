import type { WatchIntent } from '../optimizer-v2/types'
import type { MissedDeadline, UpcomingDeadline, DeadlineCheckResult } from './types'

/**
 * Detect deadlines that have passed for watch intents
 *
 * @param intents - Watch intents with potential deadlines
 * @param currentDate - Current date for comparison
 * @param userId - User ID for tracking
 * @returns Array of missed deadlines with suggested new dates
 */
export function detectMissedDeadlines(
  intents: WatchIntent[],
  currentDate: Date,
  userId: string
): MissedDeadline[] {
  const missedDeadlines: MissedDeadline[] = []

  for (const intent of intents) {
    if (!intent.deadline) continue

    const deadlineDate = new Date(intent.deadline)
    // Compare dates only (not times)
    const deadlineDay = new Date(deadlineDate.toISOString().split('T')[0])
    const currentDay = new Date(currentDate.toISOString().split('T')[0])

    if (deadlineDay < currentDay) {
      const diffTime = currentDay.getTime() - deadlineDay.getTime()
      const missedByDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      // Calculate suggested new deadline: missed days + 3 day buffer from current
      const suggestedDate = new Date(currentDay)
      suggestedDate.setDate(suggestedDate.getDate() + 3)
      const suggestedDeadline = suggestedDate.toISOString().split('T')[0]

      missedDeadlines.push({
        user_id: userId,
        intent_id: intent.id,
        intent_title: intent.title,
        original_deadline: intent.deadline,
        missed_by_days: missedByDays,
        suggested_new_deadline: suggestedDeadline,
        reason: `Deadline passed ${missedByDays} day${missedByDays === 1 ? '' : 's'} ago`,
      })
    }
  }

  return missedDeadlines
}

/**
 * Detect upcoming deadlines within specified days
 *
 * @param intents - Watch intents with potential deadlines
 * @param currentDate - Current date for comparison
 * @param daysAhead - How many days ahead to look (default: 7)
 * @returns Array of upcoming deadlines with urgency flags
 */
export function detectUpcomingDeadlines(
  intents: WatchIntent[],
  currentDate: Date,
  daysAhead: number = 7
): UpcomingDeadline[] {
  const upcomingDeadlines: UpcomingDeadline[] = []

  for (const intent of intents) {
    if (!intent.deadline) continue

    const deadlineDate = new Date(intent.deadline)
    // Compare dates only (not times)
    const deadlineDay = new Date(deadlineDate.toISOString().split('T')[0])
    const currentDay = new Date(currentDate.toISOString().split('T')[0])

    // Skip past deadlines
    if (deadlineDay <= currentDay) continue

    const diffTime = deadlineDay.getTime() - currentDay.getTime()
    const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Only include if within the look-ahead window
    if (daysUntil <= daysAhead) {
      upcomingDeadlines.push({
        intent_id: intent.id,
        intent_title: intent.title,
        deadline: intent.deadline,
        days_until: daysUntil,
        is_urgent: daysUntil <= 3,
      })
    }
  }

  // Sort by days until (most urgent first)
  return upcomingDeadlines.sort((a, b) => a.days_until - b.days_until)
}

/**
 * Check all deadlines for missed and upcoming
 *
 * @param intents - Watch intents to check
 * @param currentDate - Current date (defaults to now)
 * @param userId - User ID for tracking
 * @returns Combined result of missed and upcoming deadlines
 */
export function checkDeadlines(
  intents: WatchIntent[],
  currentDate: Date = new Date(),
  userId: string = ''
): DeadlineCheckResult {
  return {
    missed_deadlines: detectMissedDeadlines(intents, currentDate, userId),
    upcoming_deadlines: detectUpcomingDeadlines(intents, currentDate),
  }
}
