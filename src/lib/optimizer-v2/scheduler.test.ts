import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  scheduleIntents,
  fitIntentIntoSlots,
  detectOverload,
} from './scheduler'
import type { WatchIntent, WatchTimeSettings } from './types'
import type { DaySlot } from './time-calculator'

describe('scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  const defaultSettings: WatchTimeSettings = {
    watch_speed: 2,
    hours_per_week: 10,
  }

  const createIntent = (overrides: Partial<WatchIntent>): WatchIntent => ({
    id: 'i1',
    tmdb_id: 123,
    title: 'Test',
    type: 'movie',
    source: 'taste_match',
    service_id: 'netflix',
    service_name: 'Netflix',
    release_date: null,
    poster_path: null,
    runtime_minutes: 120,
    taste_match_score: 50,
    priority_score: 50,
    ...overrides,
  })

  describe('fitIntentIntoSlots', () => {
    it('schedules movie on single day if time available', () => {
      const intent = createIntent({ runtime_minutes: 60 })
      const slots: DaySlot[] = [
        { date: '2026-01-15', available_minutes: 100 },
        { date: '2026-01-16', available_minutes: 100 },
      ]

      const result = fitIntentIntoSlots(intent, slots)

      expect(result.scheduled).toBe(true)
      expect(result.slots).toHaveLength(1)
      expect(result.slots[0].date).toBe('2026-01-15')
    })

    it('splits TV show across multiple days', () => {
      const intent = createIntent({
        type: 'tv',
        runtime_minutes: 0,
        episode_count: 10, // 10 * 45 = 450 min
      })
      const slots: DaySlot[] = [
        { date: '2026-01-15', available_minutes: 90 },
        { date: '2026-01-16', available_minutes: 90 },
        { date: '2026-01-17', available_minutes: 90 },
        { date: '2026-01-18', available_minutes: 90 },
        { date: '2026-01-19', available_minutes: 90 },
      ]

      const result = fitIntentIntoSlots(intent, slots)

      expect(result.scheduled).toBe(true)
      expect(result.slots.length).toBeGreaterThan(1)
    })

    it('returns unscheduled when not enough time', () => {
      const intent = createIntent({ runtime_minutes: 500 })
      const slots: DaySlot[] = [{ date: '2026-01-15', available_minutes: 50 }]

      const result = fitIntentIntoSlots(intent, slots)

      expect(result.scheduled).toBe(false)
      expect(result.overflow_minutes).toBeGreaterThan(0)
    })
  })

  describe('detectOverload', () => {
    it('detects when total duration exceeds available time', () => {
      const intents = [
        createIntent({ id: 'i1', runtime_minutes: 300 }),
        createIntent({ id: 'i2', runtime_minutes: 300 }),
        createIntent({ id: 'i3', runtime_minutes: 300 }), // Total: 900 min
      ]

      const result = detectOverload(intents, defaultSettings) // 600 min/week

      expect(result.overloaded).toBe(true)
      expect(result.overflow_minutes).toBe(300)
      expect(result.suggested_cuts.length).toBeGreaterThan(0)
    })

    it('returns not overloaded when fits', () => {
      const intents = [
        createIntent({ id: 'i1', runtime_minutes: 200 }),
        createIntent({ id: 'i2', runtime_minutes: 200 }),
      ]

      const result = detectOverload(intents, defaultSettings)

      expect(result.overloaded).toBe(false)
      expect(result.overflow_minutes).toBe(0)
    })
  })

  describe('scheduleIntents', () => {
    it('schedules all intents that fit', () => {
      const intents = [
        createIntent({ id: 'i1', runtime_minutes: 120, priority_score: 100 }),
        createIntent({ id: 'i2', runtime_minutes: 120, priority_score: 50 }),
      ]

      const result = scheduleIntents(intents, '2026-01-15', defaultSettings)

      expect(result.schedule.length).toBeGreaterThanOrEqual(2)
      expect(result.unscheduled).toHaveLength(0)
    })

    it('prioritizes higher priority intents when overloaded', () => {
      const intents = [
        createIntent({ id: 'high', runtime_minutes: 400, priority_score: 100 }),
        createIntent({ id: 'low', runtime_minutes: 400, priority_score: 20 }),
      ]

      const result = scheduleIntents(intents, '2026-01-15', defaultSettings)

      // High priority should be scheduled, low priority unscheduled
      expect(result.schedule.some((s) => s.intent_id === 'high')).toBe(true)
      expect(result.unscheduled.some((i) => i.id === 'low')).toBe(true)
    })

    it('respects deadlines when scheduling', () => {
      const intents = [
        createIntent({
          id: 'urgent',
          runtime_minutes: 120,
          deadline: '2026-01-18',
          priority_score: 150,
        }),
        createIntent({ id: 'normal', runtime_minutes: 120, priority_score: 50 }),
      ]

      const result = scheduleIntents(intents, '2026-01-15', defaultSettings)

      // Urgent should be scheduled before deadline
      const urgentSlots = result.schedule.filter((s) => s.intent_id === 'urgent')
      expect(urgentSlots.length).toBeGreaterThan(0)
      expect(new Date(urgentSlots[0].date) <= new Date('2026-01-18')).toBe(true)
    })
  })
})
