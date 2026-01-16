import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { GET, PATCH } from './route'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

describe('/api/taste-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns taste profile for authenticated user', async () => {
      const mockProfile = {
        genres: ['Action', 'Drama'],
        favorite_shows: ['Breaking Bad', 'The Office'],
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.genres).toEqual(['Action', 'Drama'])
      expect(data.favorite_shows).toEqual(['Breaking Bad', 'The Office'])
    })

    it('returns empty arrays when no taste profile exists', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }, // No rows found
              }),
            }),
          }),
        }),
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.genres).toEqual([])
      expect(data.favorite_shows).toEqual([])
    })
  })

  describe('PATCH', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const request = new NextRequest('http://localhost/api/taste-profile', {
        method: 'PATCH',
        body: JSON.stringify({ genres: ['Action'] }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('validates genres against allowed list', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new NextRequest('http://localhost/api/taste-profile', {
        method: 'PATCH',
        body: JSON.stringify({ genres: ['InvalidGenre', 'Action'] }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid genre')
    })

    it('updates taste profile and clears optimizer cache', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { genres: ['Action', 'Comedy'], favorite_shows: ['The Office'] },
            error: null,
          }),
        }),
      })

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'taste_profiles') {
          return { upsert: mockUpsert }
        }
        if (table === 'optimizer_plans') {
          return { delete: mockDelete }
        }
        return {}
      })

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: mockFrom,
      })

      const request = new NextRequest('http://localhost/api/taste-profile', {
        method: 'PATCH',
        body: JSON.stringify({
          genres: ['Action', 'Comedy'],
          favorite_shows: ['The Office'],
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('optimizer_plans')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('accepts partial updates (genres only)', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { genres: ['Drama'], favorite_shows: [] },
            error: null,
          }),
        }),
      })

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'taste_profiles') {
          return { upsert: mockUpsert }
        }
        if (table === 'optimizer_plans') {
          return { delete: mockDelete }
        }
        return {}
      })

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: mockFrom,
      })

      const request = new NextRequest('http://localhost/api/taste-profile', {
        method: 'PATCH',
        body: JSON.stringify({ genres: ['Drama'] }),
      })

      const response = await PATCH(request)
      expect(response.status).toBe(200)
    })
  })
})
