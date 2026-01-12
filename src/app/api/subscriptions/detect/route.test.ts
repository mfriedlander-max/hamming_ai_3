import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock the detector
vi.mock('@/lib/email/detector', () => ({
  detectSubscriptions: vi.fn(),
  filterExistingSubscriptions: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { detectSubscriptions, filterExistingSubscriptions } from '@/lib/email/detector'
import { POST } from './route'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>
const mockDetectSubscriptions = detectSubscriptions as ReturnType<typeof vi.fn>
const mockFilterExisting = filterExistingSubscriptions as ReturnType<typeof vi.fn>

describe('/api/subscriptions/detect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      })

      const request = new NextRequest('http://localhost/api/subscriptions/detect', {
        method: 'POST',
        body: JSON.stringify({ email_id: 'email-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when email_id is missing', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      })

      const request = new NextRequest('http://localhost/api/subscriptions/detect', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('email_id is required')
    })

    it('detects subscriptions and filters out existing ones', async () => {
      const mockEmailData = {
        id: 'email-1',
        email: 'user@gmail.com',
        access_token: null,
      }

      const mockExistingSubs = [
        { service: { slug: 'netflix' } },
      ]

      const mockDetected = [
        { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
        { service_slug: 'hulu', service_name: 'Hulu', confidence: 'high', detected_from: 'no-reply@hulu.com' },
      ]

      const mockFiltered = [
        { service_slug: 'hulu', service_name: 'Hulu', confidence: 'high', detected_from: 'no-reply@hulu.com' },
      ]

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'user_emails') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockEmailData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockExistingSubs,
                  error: null,
                }),
              }),
            }
          }
          return {}
        }),
      })

      mockDetectSubscriptions.mockReturnValue(mockDetected)
      mockFilterExisting.mockReturnValue(mockFiltered)

      const request = new NextRequest('http://localhost/api/subscriptions/detect', {
        method: 'POST',
        body: JSON.stringify({ email_id: 'email-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.detected).toHaveLength(1)
      expect(data.detected[0].service_slug).toBe('hulu')
      expect(mockFilterExisting).toHaveBeenCalledWith(mockDetected, ['netflix'])
    })

    it('returns 404 when email not found', async () => {
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
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' },
                }),
              }),
            }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost/api/subscriptions/detect', {
        method: 'POST',
        body: JSON.stringify({ email_id: 'nonexistent' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Connected email not found')
    })

    it('returns empty array when all detected services already subscribed', async () => {
      const mockEmailData = { id: 'email-1', email: 'user@gmail.com' }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'user_emails') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockEmailData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }
          }
          if (table === 'subscriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ service: { slug: 'netflix' } }, { service: { slug: 'hulu' } }],
                  error: null,
                }),
              }),
            }
          }
          return {}
        }),
      })

      mockDetectSubscriptions.mockReturnValue([
        { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
      ])
      mockFilterExisting.mockReturnValue([])

      const request = new NextRequest('http://localhost/api/subscriptions/detect', {
        method: 'POST',
        body: JSON.stringify({ email_id: 'email-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.detected).toHaveLength(0)
    })
  })
})
