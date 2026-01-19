import type { TMDBMovieResponse, TMDBTVResponse, TMDBShowDetails } from './types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface TMDBClient {
  getUpcomingMovies(): Promise<TMDBMovieResponse>
  getUpcomingTVShows(): Promise<TMDBTVResponse>
  getMoviesByProvider(providerId: number): Promise<TMDBMovieResponse>
  getTVShowsByProvider(providerId: number): Promise<TMDBTVResponse>
  getShowDetails(seriesId: number): Promise<TMDBShowDetails>
}

export function createTMDBClient(apiKey: string): TMDBClient {
  if (!apiKey) {
    throw new Error('TMDB API key is required')
  }

  async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
    // TMDB v3 API uses api_key query param, not Bearer token
    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  return {
    async getUpcomingMovies(): Promise<TMDBMovieResponse> {
      return fetchFromTMDB('/movie/upcoming?language=en-US&page=1')
    },

    async getUpcomingTVShows(): Promise<TMDBTVResponse> {
      return fetchFromTMDB('/tv/on_the_air?language=en-US&page=1')
    },

    async getMoviesByProvider(providerId: number): Promise<TMDBMovieResponse> {
      const params = new URLSearchParams({
        language: 'en-US',
        page: '1',
        with_watch_providers: providerId.toString(),
        watch_region: 'US',
        sort_by: 'popularity.desc',
      })
      return fetchFromTMDB(`/discover/movie?${params}`)
    },

    async getTVShowsByProvider(providerId: number): Promise<TMDBTVResponse> {
      const params = new URLSearchParams({
        language: 'en-US',
        page: '1',
        with_watch_providers: providerId.toString(),
        watch_region: 'US',
        sort_by: 'popularity.desc',
      })
      return fetchFromTMDB(`/discover/tv?${params}`)
    },

    async getShowDetails(seriesId: number): Promise<TMDBShowDetails> {
      return fetchFromTMDB(`/tv/${seriesId}?language=en-US`)
    },
  }
}
