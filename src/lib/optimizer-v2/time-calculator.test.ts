import { describe, it, expect } from 'vitest'
import {
  calculateAvailableTime,
  estimateWatchDuration,
  canFitInSchedule,
  getWeeklySlots,
} from './time-calculator'
import type { WatchIntent, WatchTimeSettings } from './types'

describe('time-calculator', () => {
  const defaultSettings: WatchTimeSettings = {
    watch_speed: 2, // 2 eps/day
    hours_per_week: 10,
  }

  describe('calculateAvailableTime', () => {
    it('calculates minutes per week from hours setting', () => {
      const result = calculateAvailableTime(defaultSettings)
      expect(result.minutes_per_week).toBe(600) // 10 * 60
    })

    it('calculates minutes per day based on 7-day week', () => {
      const result = calculateAvailableTime(defaultSettings)
      expect(result.minutes_per_day).toBeCloseTo(85.7, 1) // 600/7
    })
  })

  describe('estimateWatchDuration', () => {
    it('returns runtime_minutes for movies', () => {
      const intent: Partial<WatchIntent> = {
        type: 'movie',
        runtime_minutes: 120,
      }
      expect(estimateWatchDuration(intent as WatchIntent)).toBe(120)
    })

    it('calculates TV duration from episode count and average runtime', () => {
      const intent: Partial<WatchIntent> = {
        type: 'tv',
        episode_count: 10,
      }
      // 10 eps * 45 min default = 450
      expect(estimateWatchDuration(intent as WatchIntent)).toBe(450)
    })

    it('uses default runtime when episode_count missing', () => {
      const intent: Partial<WatchIntent> = {
        type: 'tv',
      }
      // Default: 10 eps * 45 min = 450
      expect(estimateWatchDuration(intent as WatchIntent)).toBe(450)
    })
  })

  describe('canFitInSchedule', () => {
    it('returns true when duration fits in available time', () => {
      const result = canFitInSchedule(300, 600) // 5 hrs fits in 10 hrs
      expect(result.fits).toBe(true)
      expect(result.overflow_minutes).toBe(0)
    })

    it('returns false with overflow when duration exceeds available', () => {
      const result = canFitInSchedule(700, 600) // 11.6 hrs > 10 hrs
      expect(result.fits).toBe(false)
      expect(result.overflow_minutes).toBe(100)
    })
  })

  describe('getWeeklySlots', () => {
    it('generates 7 days of slots from start date', () => {
      const slots = getWeeklySlots('2026-01-15', defaultSettings)
      expect(slots).toHaveLength(7)
      expect(slots[0].date).toBe('2026-01-15')
      expect(slots[6].date).toBe('2026-01-21')
    })

    it('each slot has correct available minutes', () => {
      const slots = getWeeklySlots('2026-01-15', defaultSettings)
      slots.forEach((slot) => {
        expect(slot.available_minutes).toBeCloseTo(85.7, 1)
      })
    })
  })
})
