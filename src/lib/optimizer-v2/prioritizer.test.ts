import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculatePriorityScore,
  prioritizeIntents,
  getDeadlineBoost,
  getSourceBoost,
  getRecencyBoost,
} from './prioritizer'
import type { WatchIntent } from './types'
import { PRIORITY_WEIGHTS } from './types'

describe('prioritizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  describe('getDeadlineBoost', () => {
    it('returns +50 for deadline within 7 days', () => {
      expect(getDeadlineBoost('2026-01-20')).toBe(PRIORITY_WEIGHTS.DEADLINE_URGENT)
    })

    it('returns +30 for deadline within 14 days', () => {
      expect(getDeadlineBoost('2026-01-25')).toBe(PRIORITY_WEIGHTS.DEADLINE_SOON)
    })

    it('returns 0 for deadline beyond 14 days', () => {
      expect(getDeadlineBoost('2026-02-15')).toBe(0)
    })

    it('returns 0 when no deadline', () => {
      expect(getDeadlineBoost(undefined)).toBe(0)
    })
  })

  describe('getSourceBoost', () => {
    it('returns +40 for friend_share', () => {
      expect(getSourceBoost('friend_share')).toBe(PRIORITY_WEIGHTS.FRIEND_SHARE)
    })

    it('returns +10 for watchlist', () => {
      expect(getSourceBoost('watchlist')).toBe(PRIORITY_WEIGHTS.WATCHLIST)
    })

    it('returns +10 for binge_plan', () => {
      expect(getSourceBoost('binge_plan')).toBe(PRIORITY_WEIGHTS.BINGE_PLAN)
    })

    it('returns 0 for taste_match (score handled separately)', () => {
      expect(getSourceBoost('taste_match')).toBe(0)
    })
  })

  describe('getRecencyBoost', () => {
    it('returns +20 for release within 7 days', () => {
      expect(getRecencyBoost('2026-01-12')).toBe(PRIORITY_WEIGHTS.RELEASE_RECENT)
    })

    it('returns 0 for older releases', () => {
      expect(getRecencyBoost('2026-01-01')).toBe(0)
    })
  })

  describe('calculatePriorityScore', () => {
    it('combines all boosts correctly', () => {
      const intent: WatchIntent = {
        id: '1',
        tmdb_id: 123,
        title: 'Test',
        type: 'movie',
        source: 'friend_share',
        service_id: 'netflix',
        service_name: 'Netflix',
        release_date: '2026-01-12', // Recent
        poster_path: null,
        runtime_minutes: 120,
        taste_match_score: 60, // +18 (scaled to 30 max)
        priority_score: 0,
        deadline: '2026-01-20', // Urgent
      }

      const score = calculatePriorityScore(intent)
      // 50 (deadline) + 40 (friend) + 18 (taste 60% of 30) + 20 (recent) = 128
      expect(score).toBe(128)
    })
  })

  describe('prioritizeIntents', () => {
    it('sorts intents by priority score descending', () => {
      const intents: WatchIntent[] = [
        {
          id: '1',
          tmdb_id: 1,
          title: 'Taste Match',
          type: 'movie',
          source: 'taste_match',
          service_id: 'netflix',
          service_name: 'Netflix',
          release_date: null,
          poster_path: null,
          runtime_minutes: 120,
          taste_match_score: 20,
          priority_score: 0,
        },
        {
          id: '2',
          tmdb_id: 2,
          title: 'Friend Share',
          type: 'movie',
          source: 'friend_share',
          service_id: 'netflix',
          service_name: 'Netflix',
          release_date: null,
          poster_path: null,
          runtime_minutes: 120,
          taste_match_score: 0,
          priority_score: 0,
        },
        {
          id: '3',
          tmdb_id: 3,
          title: 'Binge Plan',
          type: 'tv',
          source: 'binge_plan',
          service_id: 'netflix',
          service_name: 'Netflix',
          release_date: null,
          poster_path: null,
          runtime_minutes: 0,
          taste_match_score: 0,
          priority_score: 0,
          deadline: '2026-01-18',
        },
      ]

      const sorted = prioritizeIntents(intents)

      // Binge plan with urgent deadline should be first (50 + 10 = 60)
      expect(sorted[0].id).toBe('3')
      // Friend share second (40)
      expect(sorted[1].id).toBe('2')
      // Taste match last (6 from 20% of 30)
      expect(sorted[2].id).toBe('1')
    })

    it('assigns priority_score to each intent', () => {
      const intents: WatchIntent[] = [
        {
          id: '1',
          tmdb_id: 1,
          title: 'Test',
          type: 'movie',
          source: 'friend_share',
          service_id: 'netflix',
          service_name: 'Netflix',
          release_date: null,
          poster_path: null,
          runtime_minutes: 120,
          taste_match_score: 0,
          priority_score: 0,
        },
      ]

      const result = prioritizeIntents(intents)

      expect(result[0].priority_score).toBe(40) // friend_share boost
    })
  })
})
