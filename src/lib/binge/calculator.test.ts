import { describe, it, expect } from 'vitest'
import { calculateBingePlan, formatDateRange } from './calculator'
import type { BingePlanInput } from './types'
import type { TMDBShowDetails } from '@/lib/tmdb/types'

const createMockShow = (overrides: Partial<TMDBShowDetails> = {}): TMDBShowDetails => ({
  id: 12345,
  name: 'Test Show',
  number_of_episodes: 10,
  number_of_seasons: 1,
  episode_run_time: [45],
  status: 'Ended',
  first_air_date: '2026-01-01',
  poster_path: '/test.jpg',
  overview: 'A test show',
  genres: [{ id: 18, name: 'Drama' }],
  ...overrides,
})

const createMockInput = (overrides: Partial<BingePlanInput> = {}): BingePlanInput => ({
  show: createMockShow(),
  service: {
    id: 'netflix-uuid',
    name: 'Netflix',
    monthly_cost: 15.99,
  },
  release_date: '2026-02-01',
  watch_speed: 2,
  ...overrides,
})

describe('calculateBingePlan', () => {
  it('calculates total hours from episode count and runtime', () => {
    const input = createMockInput({
      show: createMockShow({
        number_of_episodes: 10,
        episode_run_time: [60], // 1 hour episodes
      }),
    })

    const plan = calculateBingePlan(input)

    expect(plan.total_episodes).toBe(10)
    expect(plan.total_hours).toBe(10) // 10 episodes * 60 min / 60 = 10 hours
  })

  it('calculates days to complete based on watch speed', () => {
    const input = createMockInput({
      show: createMockShow({ number_of_episodes: 10 }),
      watch_speed: 2, // 2 episodes per day
    })

    const plan = calculateBingePlan(input)

    expect(plan.days_to_complete).toBe(5) // 10 episodes / 2 per day = 5 days
  })

  it('rounds up days to complete when not evenly divisible', () => {
    const input = createMockInput({
      show: createMockShow({ number_of_episodes: 10 }),
      watch_speed: 3, // 3 episodes per day
    })

    const plan = calculateBingePlan(input)

    expect(plan.days_to_complete).toBe(4) // ceil(10/3) = 4 days
  })

  it('sets subscribe date 1 day before release', () => {
    const input = createMockInput({
      release_date: '2026-02-15',
    })

    const plan = calculateBingePlan(input)

    expect(plan.subscribe_date).toBe('2026-02-14')
  })

  it('sets cancel date 2 days after binge completion', () => {
    const input = createMockInput({
      show: createMockShow({ number_of_episodes: 10 }),
      release_date: '2026-02-01',
      watch_speed: 2, // 5 days to complete
    })

    const plan = calculateBingePlan(input)

    // Release Feb 1 + 5 days + 2 buffer = Feb 8
    expect(plan.cancel_date).toBe('2026-02-08')
  })

  it('calculates estimated cost based on binge duration', () => {
    const input = createMockInput({
      show: createMockShow({ number_of_episodes: 10 }),
      service: { id: 'test', name: 'Test', monthly_cost: 15.99 },
      watch_speed: 2, // 5 days = 1 month
    })

    const plan = calculateBingePlan(input)

    expect(plan.estimated_cost).toBe(15.99) // 1 month
  })

  it('charges for multiple months when binge spans months', () => {
    const input = createMockInput({
      show: createMockShow({ number_of_episodes: 100 }),
      service: { id: 'test', name: 'Test', monthly_cost: 10 },
      watch_speed: 2, // 50 days = 2 months
    })

    const plan = calculateBingePlan(input)

    expect(plan.estimated_cost).toBe(20) // 2 months
  })

  it('uses default runtime of 45 minutes when episode_run_time is empty', () => {
    const input = createMockInput({
      show: createMockShow({
        number_of_episodes: 10,
        episode_run_time: [],
      }),
    })

    const plan = calculateBingePlan(input)

    // 10 * 45 / 60 = 7.5 → rounds to 8
    expect(plan.total_hours).toBe(8)
  })

  it('includes show and service info in plan', () => {
    const input = createMockInput({
      show: createMockShow({
        id: 99999,
        name: 'Breaking Bad',
        poster_path: '/breaking.jpg',
      }),
      service: {
        id: 'netflix-id',
        name: 'Netflix',
        monthly_cost: 15.99,
      },
    })

    const plan = calculateBingePlan(input)

    expect(plan.show_id).toBe(99999)
    expect(plan.show_title).toBe('Breaking Bad')
    expect(plan.service_id).toBe('netflix-id')
    expect(plan.service_name).toBe('Netflix')
    expect(plan.poster_url).toBe('https://image.tmdb.org/t/p/w500/breaking.jpg')
  })

  it('handles null poster_path', () => {
    const input = createMockInput({
      show: createMockShow({ poster_path: null }),
    })

    const plan = calculateBingePlan(input)

    expect(plan.poster_url).toBeNull()
  })
})

describe('formatDateRange', () => {
  it('formats date range as readable string', () => {
    const result = formatDateRange('2026-02-01', '2026-02-08')

    expect(result).toBe('Feb 1 - Feb 8, 2026')
  })

  it('handles dates across months', () => {
    const result = formatDateRange('2026-01-28', '2026-02-05')

    expect(result).toBe('Jan 28 - Feb 5, 2026')
  })

  it('handles dates across years', () => {
    const result = formatDateRange('2025-12-28', '2026-01-05')

    expect(result).toBe('Dec 28, 2025 - Jan 5, 2026')
  })
})
