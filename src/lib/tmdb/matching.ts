import type { MatchedContent } from '../types/content'
import type { TMDBMovie, TMDBTVShow } from './types'
import { getGenreNames } from './types'

export interface TasteProfile {
  favorite_genres: string[]
  favorite_shows: string[]
}

export interface MatchResult {
  score: number
  reason: string
}

const GENRE_POINTS = 20
const MAX_GENRE_POINTS = 60
const TITLE_MATCH_POINTS = 40
const MAX_SCORE = 100

/**
 * Calculate match score between content and user taste profile
 * - Genre match: +20 per overlap (max 60)
 * - Favorite show title match: +40 if title contains favorite
 * - Cap at 100
 */
export function calculateMatchScore(
  content: { title?: string; genres: string[] },
  tasteProfile: TasteProfile
): MatchResult {
  let score = 0
  const matchedGenres: string[] = []
  let matchedShow: string | null = null

  // Genre matching
  for (const genre of content.genres) {
    const normalizedGenre = genre.toLowerCase()
    for (const favoriteGenre of tasteProfile.favorite_genres) {
      if (normalizedGenre === favoriteGenre.toLowerCase()) {
        matchedGenres.push(favoriteGenre)
        break
      }
    }
  }

  const genreScore = Math.min(matchedGenres.length * GENRE_POINTS, MAX_GENRE_POINTS)
  score += genreScore

  // Title matching against favorite shows
  if (content.title) {
    const normalizedTitle = content.title.toLowerCase()
    for (const show of tasteProfile.favorite_shows) {
      if (normalizedTitle.includes(show.toLowerCase())) {
        matchedShow = show
        score += TITLE_MATCH_POINTS
        break
      }
    }
  }

  // Cap score at 100
  score = Math.min(score, MAX_SCORE)

  // Build reason string
  let reason = ''
  if (matchedShow) {
    reason = `Related to ${matchedShow}`
    if (matchedGenres.length > 0) {
      reason += ` with ${matchedGenres.join(', ')} elements`
    }
  } else if (matchedGenres.length > 0) {
    reason = `Matches your ${matchedGenres.join(', ')} taste`
  }

  return { score, reason }
}

/**
 * Convert TMDB content to MatchedContent with scores
 * Filters out content with 0 score
 * Sorts by score descending
 */
export function matchContentToTaste(
  content: TMDBMovie[] | TMDBTVShow[],
  type: 'movie' | 'tv',
  tasteProfile: TasteProfile
): MatchedContent[] {
  const matched: MatchedContent[] = []

  for (const item of content) {
    const title = type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name
    const releaseDate =
      type === 'movie'
        ? (item as TMDBMovie).release_date
        : (item as TMDBTVShow).first_air_date
    const genres = getGenreNames(item.genre_ids)

    const { score, reason } = calculateMatchScore({ title, genres }, tasteProfile)

    if (score > 0) {
      // Build poster URL from TMDB path
      const posterUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : undefined

      matched.push({
        id: `${type}-${item.id}`,
        tmdb_id: item.id,
        title,
        type,
        release_date: releaseDate,
        genres,
        poster_url: posterUrl,
        match_score: score,
        match_reason: reason,
      })
    }
  }

  // Sort by score descending
  return matched.sort((a, b) => b.match_score - a.match_score)
}
