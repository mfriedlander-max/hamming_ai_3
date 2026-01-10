import type { TMDBMovieResponse, TMDBTVResponse } from './types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface TMDBClient {
  getUpcomingMovies(): Promise<TMDBMovieResponse>
  getUpcomingTVShows(): Promise<TMDBTVResponse>
  getMoviesByProvider(providerId: number): Promise<TMDBMovieResponse>
  getTVShowsByProvider(providerId: number): Promise<TMDBTVResponse>
}

export function createTMDBClient(apiKey: string): TMDBClient {
  if (!apiKey) {
    throw new Error('TMDB API key is required')
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, { headers })

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
  }
}
