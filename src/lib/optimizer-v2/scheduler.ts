import type { WatchIntent, WatchSlot, WatchTimeSettings } from './types'
import {
  calculateAvailableTime,
  estimateWatchDuration,
  getWeeklySlots,
  DaySlot,
} from './time-calculator'

export interface FitResult {
  scheduled: boolean
  slots: WatchSlot[]
  overflow_minutes: number
}

export interface OverloadResult {
  overloaded: boolean
  overflow_minutes: number
  suggested_cuts: WatchIntent[]
}

export interface ScheduleResult {
  schedule: WatchSlot[]
  unscheduled: WatchIntent[]
  overload?: OverloadResult
}

/**
 * Try to fit an intent into available time slots
 */
export function fitIntentIntoSlots(
  intent: WatchIntent,
  availableSlots: DaySlot[]
): FitResult {
  const duration = estimateWatchDuration(intent)
  let remaining = duration
  const slots: WatchSlot[] = []

  for (const daySlot of availableSlots) {
    if (remaining <= 0) break

    const useMinutes = Math.min(remaining, daySlot.available_minutes)
    if (useMinutes > 0) {
      slots.push({
        intent_id: intent.id,
        date: daySlot.date,
        duration_minutes: useMinutes,
      })
      remaining -= useMinutes
    }
  }

  return {
    scheduled: remaining <= 0,
    slots,
    overflow_minutes: Math.max(0, remaining),
  }
}

/**
 * Detect if intents exceed available weekly time
 */
export function detectOverload(
  intents: WatchIntent[],
  settings: WatchTimeSettings
): OverloadResult {
  const { minutes_per_week } = calculateAvailableTime(settings)

  let totalDuration = 0
  for (const intent of intents) {
    totalDuration += estimateWatchDuration(intent)
  }

  const overflow = totalDuration - minutes_per_week

  if (overflow <= 0) {
    return { overloaded: false, overflow_minutes: 0, suggested_cuts: [] }
  }

  // Suggest cutting lowest priority intents until we fit
  const sortedByPriority = [...intents].sort(
    (a, b) => a.priority_score - b.priority_score
  )
  const suggested_cuts: WatchIntent[] = []
  let cutMinutes = 0

  for (const intent of sortedByPriority) {
    if (cutMinutes >= overflow) break
    suggested_cuts.push(intent)
    cutMinutes += estimateWatchDuration(intent)
  }

  return {
    overloaded: true,
    overflow_minutes: overflow,
    suggested_cuts,
  }
}

/**
 * Schedule intents into weekly time slots
 */
export function scheduleIntents(
  intents: WatchIntent[],
  startDate: string,
  settings: WatchTimeSettings
): ScheduleResult {
  // Check for overload first
  const overload = detectOverload(intents, settings)

  // Get available slots for the week
  const daySlots = getWeeklySlots(startDate, settings)
  const availableSlots = daySlots.map((s) => ({ ...s })) // Clone to track remaining time

  // Sort by priority (highest first), then by deadline (soonest first)
  const sortedIntents = [...intents].sort((a, b) => {
    // Deadline urgency first
    if (a.deadline && !b.deadline) return -1
    if (!a.deadline && b.deadline) return 1
    if (a.deadline && b.deadline) {
      const dateCompare =
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      if (dateCompare !== 0) return dateCompare
    }
    // Then by priority score
    return b.priority_score - a.priority_score
  })

  const schedule: WatchSlot[] = []
  const unscheduled: WatchIntent[] = []

  for (const intent of sortedIntents) {
    const result = fitIntentIntoSlots(intent, availableSlots)

    if (result.scheduled) {
      schedule.push(...result.slots)

      // Update available time in slots
      for (const slot of result.slots) {
        const daySlot = availableSlots.find((s) => s.date === slot.date)
        if (daySlot) {
          daySlot.available_minutes -= slot.duration_minutes
        }
      }
    } else {
      unscheduled.push(intent)
    }
  }

  return { schedule, unscheduled, overload }
}
