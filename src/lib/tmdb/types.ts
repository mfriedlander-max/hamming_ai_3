// TMDB API response types

// Detailed TV show info (from /tv/{series_id})
export interface TMDBShowDetails {
  id: number
  name: string
  number_of_episodes: number
  number_of_seasons: number
  episode_run_time: number[] // minutes per episode
  status: string // "Returning Series" | "Ended" | "Canceled" | etc.
  first_air_date: string
  poster_path: string | null
  overview: string
  genres: { id: number; name: string }[]
}

export interface TMDBMovie {
  id: number
  title: string
  release_date: string
  genre_ids: number[]
  overview: string
  poster_path: string | null
  vote_average: number
}

export interface TMDBTVShow {
  id: number
  name: string
  first_air_date: string
  genre_ids: number[]
  overview: string
  poster_path: string | null
  vote_average: number
}

export interface TMDBMovieResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBTVResponse {
  page: number
  results: TMDBTVShow[]
  total_pages: number
  total_results: number
}

// TMDB uses numeric IDs for genres - this maps them to readable names
export const TMDB_GENRE_MAP: Record<number, string> = {
  // Movie genres
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV genres (some overlap with movies)
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
}

// Map our app's genre names to TMDB genre IDs
export function getGenreIds(genreNames: string[]): number[] {
  const reverseMap = Object.entries(TMDB_GENRE_MAP).reduce(
    (acc, [id, name]) => {
      acc[name.toLowerCase()] = parseInt(id)
      return acc
    },
    {} as Record<string, number>
  )

  return genreNames
    .map((name) => reverseMap[name.toLowerCase()])
    .filter((id): id is number => id !== undefined)
}

// Map TMDB genre IDs to names
export function getGenreNames(genreIds: number[]): string[] {
  return genreIds
    .map((id) => TMDB_GENRE_MAP[id])
    .filter((name): name is string => name !== undefined)
}

// Provider IDs from TMDB for watch providers
export const TMDB_PROVIDER_MAP: Record<string, number> = {
  netflix: 8,
  'amazon-prime': 9,
  'disney-plus': 337,
  hulu: 15,
  'hbo-max': 384,
  'apple-tv-plus': 350,
  peacock: 386,
  paramount: 531,
  'discovery-plus': 584,
  espn: 899,
  'youtube-tv': 363,
  crunchyroll: 283,
  'amazon-mgm': 9, // Same provider as Amazon Prime
  mubi: 11,
  'criterion-channel': 258,
}
