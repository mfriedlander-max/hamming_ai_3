import type { BingePlan, BingePlanInput } from './types'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const DEFAULT_EPISODE_RUNTIME = 45 // minutes

/**
 * Calculate a binge plan for a TV show
 * Returns optimal subscribe/cancel dates based on watch speed
 */
export function calculateBingePlan(input: BingePlanInput): BingePlan {
  const { show, service, release_date, watch_speed } = input

  // Calculate viewing duration
  const totalEpisodes = show.number_of_episodes
  const avgRuntime = show.episode_run_time[0] || DEFAULT_EPISODE_RUNTIME
  const totalMinutes = totalEpisodes * avgRuntime
  const totalHours = Math.round(totalMinutes / 60)

  // Calculate days to complete
  const daysToComplete = Math.ceil(totalEpisodes / watch_speed)

  // Calculate subscribe date (1 day before release)
  const releaseDate = new Date(release_date)
  const subscribeDate = new Date(releaseDate)
  subscribeDate.setDate(subscribeDate.getDate() - 1)

  // Calculate cancel date (2 days after completing the binge)
  const cancelDate = new Date(releaseDate)
  cancelDate.setDate(cancelDate.getDate() + daysToComplete + 2)

  // Calculate estimated cost (minimum 1 month)
  const months = Math.max(1, Math.ceil(daysToComplete / 30))
  const estimatedCost = service.monthly_cost * months

  // Build poster URL
  const posterUrl = show.poster_path
    ? `${TMDB_IMAGE_BASE}${show.poster_path}`
    : null

  return {
    show_id: show.id,
    show_title: show.name,
    service_id: service.id,
    service_name: service.name,
    total_episodes: totalEpisodes,
    total_hours: totalHours,
    days_to_complete: daysToComplete,
    subscribe_date: formatISODate(subscribeDate),
    cancel_date: formatISODate(cancelDate),
    estimated_cost: estimatedCost,
    watch_speed: watch_speed,
    poster_url: posterUrl,
  }
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD)
 */
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format a date range for display
 * e.g., "Feb 1 - Feb 8, 2026"
 */
export function formatDateRange(startDate: string, endDate: string): string {
  // Parse as UTC to avoid timezone issues
  const start = new Date(startDate + 'T12:00:00Z')
  const end = new Date(endDate + 'T12:00:00Z')

  const startYear = start.getUTCFullYear()
  const endYear = end.getUTCFullYear()

  const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })

  const startDay = start.getUTCDate()
  const endDay = end.getUTCDate()

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
}
