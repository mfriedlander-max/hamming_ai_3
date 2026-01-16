import { describe, it, expect } from 'vitest'
import {
  detectMissedDeadlines,
  detectUpcomingDeadlines,
  checkDeadlines,
} from './deadline-detector'
import type { WatchIntent } from '../optimizer-v2/types'

describe('deadline-detector', () => {
  const userId = 'user-123'

  // Helper to create watch intents with deadlines
  const createIntent = (
    id: string,
    title: string,
    deadline: string | undefined
  ): WatchIntent => ({
    id,
    tmdb_id: 123,
    title,
    type: 'tv',
    source: 'watchlist',
    service_id: 'svc-1',
    service_name: 'Netflix',
    release_date: null,
    poster_path: null,
    runtime_minutes: 60,
    taste_match_score: 80,
    priority_score: 50,
    deadline,
  })

  describe('detectMissedDeadlines', () => {
    it('finds deadlines that have passed', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [
        createIntent('1', 'Show A', '2025-02-05'), // 5 days missed
        createIntent('2', 'Show B', '2025-02-15'), // future - not missed
        createIntent('3', 'Show C', undefined), // no deadline
      ]

      const missed = detectMissedDeadlines(intents, currentDate, userId)

      expect(missed.length).toBe(1)
      expect(missed[0].intent_id).toBe('1')
      expect(missed[0].intent_title).toBe('Show A')
      expect(missed[0].missed_by_days).toBe(5)
    })

    it('excludes intents without deadlines', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [
        createIntent('1', 'Show A', undefined),
        createIntent('2', 'Show B', undefined),
      ]

      const missed = detectMissedDeadlines(intents, currentDate, userId)

      expect(missed.length).toBe(0)
    })

    it('calculates days missed correctly', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [createIntent('1', 'Show A', '2025-02-03')] // 7 days missed

      const missed = detectMissedDeadlines(intents, currentDate, userId)

      expect(missed[0].missed_by_days).toBe(7)
      // Suggested new deadline should be original + missed + 3 day buffer
      expect(missed[0].suggested_new_deadline).toBe('2025-02-13')
    })
  })

  describe('detectUpcomingDeadlines', () => {
    it('finds deadlines within 7 days', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [
        createIntent('1', 'Show A', '2025-02-14'), // 4 days - upcoming
        createIntent('2', 'Show B', '2025-02-25'), // 15 days - too far
        createIntent('3', 'Show C', '2025-02-05'), // past - not upcoming
      ]

      const upcoming = detectUpcomingDeadlines(intents, currentDate)

      expect(upcoming.length).toBe(1)
      expect(upcoming[0].intent_id).toBe('1')
      expect(upcoming[0].days_until).toBe(4)
    })

    it('marks urgent deadlines (≤3 days)', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [
        createIntent('1', 'Show A', '2025-02-12'), // 2 days - urgent
        createIntent('2', 'Show B', '2025-02-15'), // 5 days - not urgent
      ]

      const upcoming = detectUpcomingDeadlines(intents, currentDate)

      expect(upcoming.length).toBe(2)
      expect(upcoming.find((u) => u.intent_id === '1')?.is_urgent).toBe(true)
      expect(upcoming.find((u) => u.intent_id === '2')?.is_urgent).toBe(false)
    })
  })

  describe('checkDeadlines', () => {
    it('returns combined result of missed and upcoming', () => {
      const currentDate = new Date('2025-02-10')
      const intents = [
        createIntent('1', 'Missed Show', '2025-02-05'), // missed
        createIntent('2', 'Upcoming Show', '2025-02-13'), // upcoming urgent
        createIntent('3', 'Far Show', '2025-02-28'), // too far
      ]

      const result = checkDeadlines(intents, currentDate, userId)

      expect(result.missed_deadlines.length).toBe(1)
      expect(result.missed_deadlines[0].intent_id).toBe('1')

      expect(result.upcoming_deadlines.length).toBe(1)
      expect(result.upcoming_deadlines[0].intent_id).toBe('2')
      expect(result.upcoming_deadlines[0].is_urgent).toBe(true)
    })
  })
})
