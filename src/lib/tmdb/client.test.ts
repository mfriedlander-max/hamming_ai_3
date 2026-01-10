import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TMDBClient, createTMDBClient } from './client'

describe('TMDBClient', () => {
  const mockApiKey = 'test-api-key-12345'
  let client: TMDBClient

  beforeEach(() => {
    client = createTMDBClient(mockApiKey)
    // Mock global fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createTMDBClient', () => {
    it('creates a client with the provided API key', () => {
      expect(client).toBeDefined()
      expect(typeof client.getUpcomingMovies).toBe('function')
      expect(typeof client.getUpcomingTVShows).toBe('function')
    })

    it('throws an error if API key is not provided', () => {
      expect(() => createTMDBClient('')).toThrow('TMDB API key is required')
    })
  })

  describe('getUpcomingMovies', () => {
    it('fetches upcoming movies with correct auth header', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 123,
            title: 'Test Movie',
            release_date: '2026-02-15',
            genre_ids: [28, 878],
            overview: 'A test movie',
            poster_path: '/test.jpg',
            vote_average: 7.5,
          },
        ],
        total_pages: 1,
        total_results: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getUpcomingMovies()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.themoviedb.org/3/movie/upcoming'),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws an error when API request fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      await expect(client.getUpcomingMovies()).rejects.toThrow(
        'TMDB API error: 401 Unauthorized'
      )
    })
  })

  describe('getUpcomingTVShows', () => {
    it('fetches upcoming TV shows with correct auth header', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 456,
            name: 'Test Show',
            first_air_date: '2026-02-20',
            genre_ids: [18, 10765],
            overview: 'A test show',
            poster_path: '/test-show.jpg',
            vote_average: 8.0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getUpcomingTVShows()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.themoviedb.org/3/tv/on_the_air'),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getMoviesByProvider', () => {
    it('fetches movies for a specific streaming provider', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 789,
            title: 'Netflix Movie',
            release_date: '2026-01-15',
            genre_ids: [35],
            overview: 'A Netflix movie',
            poster_path: '/netflix.jpg',
            vote_average: 6.5,
          },
        ],
        total_pages: 1,
        total_results: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getMoviesByProvider(8) // Netflix provider ID

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /api\.themoviedb\.org\/3\/discover\/movie.*with_watch_providers=8/
        ),
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTVShowsByProvider', () => {
    it('fetches TV shows for a specific streaming provider', async () => {
      const mockResponse = {
        page: 1,
        results: [
          {
            id: 101,
            name: 'HBO Show',
            first_air_date: '2026-01-20',
            genre_ids: [18],
            overview: 'An HBO show',
            poster_path: '/hbo.jpg',
            vote_average: 9.0,
          },
        ],
        total_pages: 1,
        total_results: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await client.getTVShowsByProvider(384) // HBO Max provider ID

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /api\.themoviedb\.org\/3\/discover\/tv.*with_watch_providers=384/
        ),
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
