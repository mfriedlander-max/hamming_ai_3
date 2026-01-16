import type { WatchIntent, WatchIntentSource } from './types'
import { PRIORITY_WEIGHTS } from './types'

/**
 * Calculate deadline urgency boost
 */
export function getDeadlineBoost(deadline?: string): number {
  if (!deadline) return 0

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysUntil = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntil <= 7) return PRIORITY_WEIGHTS.DEADLINE_URGENT
  if (daysUntil <= 14) return PRIORITY_WEIGHTS.DEADLINE_SOON
  return 0
}

/**
 * Calculate source-based boost
 */
export function getSourceBoost(source: WatchIntentSource): number {
  switch (source) {
    case 'friend_share':
      return PRIORITY_WEIGHTS.FRIEND_SHARE
    case 'watchlist':
      return PRIORITY_WEIGHTS.WATCHLIST
    case 'binge_plan':
      return PRIORITY_WEIGHTS.BINGE_PLAN
    case 'favorite':
    case 'taste_match':
    default:
      return 0
  }
}

/**
 * Calculate release recency boost
 */
export function getRecencyBoost(release_date: string | null): number {
  if (!release_date) return 0

  const now = new Date()
  const releaseDate = new Date(release_date)
  const daysSince = Math.ceil(
    (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSince >= 0 && daysSince <= 7) return PRIORITY_WEIGHTS.RELEASE_RECENT
  return 0
}

/**
 * Calculate taste match contribution (scaled to max 30)
 */
function getTasteMatchContribution(score: number): number {
  // Score is 0-100, scale to 0-30
  return Math.round((score / 100) * PRIORITY_WEIGHTS.TASTE_MATCH_MAX)
}

/**
 * Calculate total priority score for an intent
 */
export function calculatePriorityScore(intent: WatchIntent): number {
  return (
    getDeadlineBoost(intent.deadline) +
    getSourceBoost(intent.source) +
    getTasteMatchContribution(intent.taste_match_score) +
    getRecencyBoost(intent.release_date)
  )
}

/**
 * Prioritize intents by calculating scores and sorting
 */
export function prioritizeIntents(intents: WatchIntent[]): WatchIntent[] {
  return intents
    .map((intent) => ({
      ...intent,
      priority_score: calculatePriorityScore(intent),
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
}
