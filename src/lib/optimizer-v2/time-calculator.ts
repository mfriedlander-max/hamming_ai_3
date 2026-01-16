import type { WatchIntent, WatchTimeSettings } from './types'

const DEFAULT_EPISODE_RUNTIME = 45 // minutes
const DEFAULT_EPISODE_COUNT = 10

export interface AvailableTime {
  minutes_per_week: number
  minutes_per_day: number
}

export interface FitResult {
  fits: boolean
  overflow_minutes: number
}

export interface DaySlot {
  date: string
  available_minutes: number
}

/**
 * Calculate available watch time from user settings
 */
export function calculateAvailableTime(settings: WatchTimeSettings): AvailableTime {
  const minutes_per_week = settings.hours_per_week * 60
  const minutes_per_day = minutes_per_week / 7
  return { minutes_per_week, minutes_per_day }
}

/**
 * Estimate total watch duration for a content item
 * Movies: use runtime_minutes
 * TV: episodes * average episode runtime
 */
export function estimateWatchDuration(intent: WatchIntent): number {
  if (intent.type === 'movie') {
    return intent.runtime_minutes || 120 // Default 2hr movie
  }

  // TV show
  const episodes = intent.episode_count || DEFAULT_EPISODE_COUNT
  return episodes * DEFAULT_EPISODE_RUNTIME
}

/**
 * Check if a duration fits in available time
 */
export function canFitInSchedule(
  duration_minutes: number,
  available_minutes: number
): FitResult {
  const fits = duration_minutes <= available_minutes
  const overflow_minutes = fits ? 0 : duration_minutes - available_minutes
  return { fits, overflow_minutes }
}

/**
 * Generate day slots for a week starting from a given date
 */
export function getWeeklySlots(
  start_date: string,
  settings: WatchTimeSettings
): DaySlot[] {
  const { minutes_per_day } = calculateAvailableTime(settings)
  const slots: DaySlot[] = []

  const start = new Date(start_date)
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    slots.push({
      date: date.toISOString().split('T')[0],
      available_minutes: minutes_per_day,
    })
  }

  return slots
}
