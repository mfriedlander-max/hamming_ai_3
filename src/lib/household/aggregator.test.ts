import { describe, it, expect } from 'vitest'
import { aggregateTasteProfiles } from './aggregator'
import type { TasteProfile } from './types'

describe('aggregateTasteProfiles', () => {
  it('should return empty arrays for empty input', () => {
    const result = aggregateTasteProfiles([])

    expect(result.genres).toEqual([])
    expect(result.favorite_shows).toEqual([])
    expect(result.member_count).toBe(0)
  })

  it('should return the profile as-is for a single member', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: ['Action', 'Comedy'],
        favorite_shows: ['Breaking Bad', 'The Office'],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toEqual(['Action', 'Comedy'])
    expect(result.favorite_shows).toEqual(['Breaking Bad', 'The Office'])
    expect(result.member_count).toBe(1)
  })

  it('should combine genres from multiple members (union)', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: ['Action', 'Comedy'],
        favorite_shows: [],
      },
      {
        user_id: 'user-2',
        genres: ['Drama', 'Comedy'],
        favorite_shows: [],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toHaveLength(3)
    expect(result.genres).toContain('Action')
    expect(result.genres).toContain('Comedy')
    expect(result.genres).toContain('Drama')
    expect(result.member_count).toBe(2)
  })

  it('should combine favorite shows from multiple members (union)', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: [],
        favorite_shows: ['Breaking Bad', 'The Office'],
      },
      {
        user_id: 'user-2',
        genres: [],
        favorite_shows: ['Game of Thrones', 'The Office'],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.favorite_shows).toHaveLength(3)
    expect(result.favorite_shows).toContain('Breaking Bad')
    expect(result.favorite_shows).toContain('The Office')
    expect(result.favorite_shows).toContain('Game of Thrones')
  })

  it('should handle members with no genres or shows', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: ['Action'],
        favorite_shows: ['Breaking Bad'],
      },
      {
        user_id: 'user-2',
        genres: [],
        favorite_shows: [],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toEqual(['Action'])
    expect(result.favorite_shows).toEqual(['Breaking Bad'])
    expect(result.member_count).toBe(2)
  })

  it('should deduplicate genres and shows (case-sensitive)', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: ['Action', 'Comedy', 'Action'],
        favorite_shows: ['Breaking Bad'],
      },
      {
        user_id: 'user-2',
        genres: ['Action'],
        favorite_shows: ['Breaking Bad'],
      },
      {
        user_id: 'user-3',
        genres: ['Comedy'],
        favorite_shows: ['Breaking Bad', 'The Office'],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toHaveLength(2)
    expect(result.favorite_shows).toHaveLength(2)
    expect(result.member_count).toBe(3)
  })

  it('should sort genres and shows alphabetically', () => {
    const profiles: TasteProfile[] = [
      {
        user_id: 'user-1',
        genres: ['Thriller', 'Action'],
        favorite_shows: ['Westworld', 'Arrow'],
      },
      {
        user_id: 'user-2',
        genres: ['Comedy'],
        favorite_shows: ['Breaking Bad'],
      },
    ]

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toEqual(['Action', 'Comedy', 'Thriller'])
    expect(result.favorite_shows).toEqual(['Arrow', 'Breaking Bad', 'Westworld'])
  })

  it('should handle large households', () => {
    const profiles: TasteProfile[] = Array.from({ length: 10 }, (_, i) => ({
      user_id: `user-${i}`,
      genres: [`Genre${i}`],
      favorite_shows: [`Show${i}`],
    }))

    const result = aggregateTasteProfiles(profiles)

    expect(result.genres).toHaveLength(10)
    expect(result.favorite_shows).toHaveLength(10)
    expect(result.member_count).toBe(10)
  })
})
