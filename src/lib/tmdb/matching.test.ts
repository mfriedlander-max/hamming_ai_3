import { describe, it, expect } from 'vitest'
import { calculateMatchScore, matchContentToTaste } from './matching'
import type { TMDBMovie, TMDBTVShow } from './types'

describe('calculateMatchScore', () => {
  const baseTasteProfile = {
    favorite_genres: ['Science Fiction', 'Action'],
    favorite_shows: ['Breaking Bad', 'Stranger Things'],
  }

  describe('genre matching', () => {
    it('returns 0 for no genre overlap', () => {
      const result = calculateMatchScore(
        { genres: ['Romance', 'Comedy'] },
        baseTasteProfile
      )
      expect(result.score).toBe(0)
      expect(result.reason).toBe('')
    })

    it('returns 20 for one genre overlap', () => {
      const result = calculateMatchScore(
        { genres: ['Science Fiction'] },
        baseTasteProfile
      )
      expect(result.score).toBe(20)
      expect(result.reason).toBe('Matches your Science Fiction taste')
    })

    it('returns 40 for two genre overlaps', () => {
      const result = calculateMatchScore(
        { genres: ['Science Fiction', 'Action'] },
        baseTasteProfile
      )
      expect(result.score).toBe(40)
      expect(result.reason).toBe('Matches your Science Fiction, Action taste')
    })

    it('caps genre score at 60 for three or more overlaps', () => {
      const profileWithManyGenres = {
        favorite_genres: [
          'Science Fiction',
          'Action',
          'Drama',
          'Thriller',
        ],
        favorite_shows: [],
      }
      const result = calculateMatchScore(
        { genres: ['Science Fiction', 'Action', 'Drama', 'Thriller'] },
        profileWithManyGenres
      )
      expect(result.score).toBe(60)
    })
  })

  describe('favorite show title matching', () => {
    it('returns +40 when title contains a favorite show name', () => {
      const result = calculateMatchScore(
        { title: 'Stranger Things Season 5', genres: [] },
        baseTasteProfile
      )
      expect(result.score).toBe(40)
      expect(result.reason).toContain('Stranger Things')
    })

    it('is case-insensitive when matching show titles', () => {
      const result = calculateMatchScore(
        { title: 'BREAKING BAD: EL CAMINO', genres: [] },
        baseTasteProfile
      )
      expect(result.score).toBe(40)
      expect(result.reason).toContain('Breaking Bad')
    })

    it('combines genre and title match scores', () => {
      const result = calculateMatchScore(
        { title: 'Stranger Things Season 5', genres: ['Science Fiction'] },
        baseTasteProfile
      )
      expect(result.score).toBe(60) // 20 (genre) + 40 (title)
    })
  })

  describe('score capping', () => {
    it('caps total score at 100', () => {
      const profileWithManyMatches = {
        favorite_genres: [
          'Science Fiction',
          'Action',
          'Drama',
          'Thriller',
        ],
        favorite_shows: ['Stranger Things'],
      }
      const result = calculateMatchScore(
        {
          title: 'Stranger Things: The Final Chapter',
          genres: ['Science Fiction', 'Action', 'Drama', 'Thriller'],
        },
        profileWithManyMatches
      )
      expect(result.score).toBe(100)
    })
  })

  describe('empty profiles', () => {
    it('returns 0 for empty taste profile', () => {
      const result = calculateMatchScore(
        { title: 'Any Movie', genres: ['Action'] },
        { favorite_genres: [], favorite_shows: [] }
      )
      expect(result.score).toBe(0)
      expect(result.reason).toBe('')
    })
  })
})

describe('matchContentToTaste', () => {
  const tasteProfile = {
    favorite_genres: ['Science Fiction', 'Action'],
    favorite_shows: ['Breaking Bad'],
  }

  describe('with movies', () => {
    it('converts TMDB movie to MatchedContent with score', () => {
      const movie: TMDBMovie = {
        id: 123,
        title: 'The Matrix Reloaded',
        release_date: '2026-03-01',
        genre_ids: [28, 878], // Action, Science Fiction
        overview: 'Neo continues his journey',
        poster_path: '/matrix.jpg',
        vote_average: 8.5,
      }

      const result = matchContentToTaste([movie], 'movie', tasteProfile)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: expect.any(String),
        tmdb_id: 123,
        title: 'The Matrix Reloaded',
        type: 'movie',
        release_date: '2026-03-01',
        genres: ['Action', 'Science Fiction'],
        poster_url: 'https://image.tmdb.org/t/p/w500/matrix.jpg',
        match_score: 40, // 2 genre overlaps
        match_reason: expect.stringContaining('Action'),
      })
    })

    it('filters out content with 0 score', () => {
      const movie: TMDBMovie = {
        id: 456,
        title: 'Romance Movie',
        release_date: '2026-03-01',
        genre_ids: [10749], // Romance
        overview: 'A love story',
        poster_path: '/romance.jpg',
        vote_average: 6.0,
      }

      const result = matchContentToTaste([movie], 'movie', tasteProfile)

      expect(result).toHaveLength(0)
    })

    it('sorts by match score descending', () => {
      const movies: TMDBMovie[] = [
        {
          id: 1,
          title: 'Low Match Movie',
          release_date: '2026-03-01',
          genre_ids: [28], // Action only
          overview: '',
          poster_path: null,
          vote_average: 5.0,
        },
        {
          id: 2,
          title: 'High Match Movie',
          release_date: '2026-03-01',
          genre_ids: [28, 878], // Action + Sci-Fi
          overview: '',
          poster_path: null,
          vote_average: 7.0,
        },
      ]

      const result = matchContentToTaste(movies, 'movie', tasteProfile)

      expect(result[0].tmdb_id).toBe(2)
      expect(result[0].match_score).toBe(40)
      expect(result[1].tmdb_id).toBe(1)
      expect(result[1].match_score).toBe(20)
    })
  })

  describe('with TV shows', () => {
    it('converts TMDB TV show to MatchedContent with score', () => {
      const show: TMDBTVShow = {
        id: 789,
        name: 'Breaking Bad: Sequel',
        first_air_date: '2026-04-15',
        genre_ids: [18], // Drama
        overview: 'Walter is back',
        poster_path: '/bb.jpg',
        vote_average: 9.0,
      }

      const result = matchContentToTaste([show], 'tv', tasteProfile)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: expect.any(String),
        tmdb_id: 789,
        title: 'Breaking Bad: Sequel',
        type: 'tv',
        release_date: '2026-04-15',
        genres: ['Drama'],
        poster_url: 'https://image.tmdb.org/t/p/w500/bb.jpg',
        match_score: 40, // Title match
        match_reason: expect.stringContaining('Breaking Bad'),
      })
    })
  })
})
