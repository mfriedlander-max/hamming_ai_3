/**
 * Aggregate taste profiles from multiple household members
 */

import type { TasteProfile, AggregatedTaste } from './types'

/**
 * Combine taste profiles from all household members into a single aggregated profile
 * Uses union logic: includes all genres and shows from all members, deduplicated
 */
export function aggregateTasteProfiles(profiles: TasteProfile[]): AggregatedTaste {
  if (profiles.length === 0) {
    return {
      genres: [],
      favorite_shows: [],
      member_count: 0,
    }
  }

  // Use Sets for efficient deduplication
  const allGenres = new Set<string>()
  const allShows = new Set<string>()

  for (const profile of profiles) {
    for (const genre of profile.genres) {
      allGenres.add(genre)
    }
    for (const show of profile.favorite_shows) {
      allShows.add(show)
    }
  }

  // Convert to sorted arrays for consistent output
  return {
    genres: Array.from(allGenres).sort(),
    favorite_shows: Array.from(allShows).sort(),
    member_count: profiles.length,
  }
}
