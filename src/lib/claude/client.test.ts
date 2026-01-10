import { describe, it, expect, vi } from 'vitest'
import { ClaudeClient, generateRecommendations } from './client'
import type { ServiceContent, Recommendation } from '@/lib/types/content'

describe('ClaudeClient', () => {
  describe('constructor', () => {
    it('throws error when API key is missing', () => {
      expect(() => new ClaudeClient('')).toThrow('ANTHROPIC_API_KEY is required')
    })

    it('creates client with valid API key', () => {
      const client = new ClaudeClient('test-api-key')
      expect(client).toBeInstanceOf(ClaudeClient)
    })
  })

  describe('generateRecommendations', () => {
    const mockServiceContent: ServiceContent[] = [
      {
        service_id: 'netflix',
        service_name: 'Netflix',
        upcoming: [
          {
            id: '1',
            tmdb_id: 123,
            title: 'Stranger Things S5',
            type: 'tv',
            release_date: '2024-06-01',
            genres: ['Sci-Fi', 'Drama'],
            match_score: 95,
            match_reason: 'Matches your sci-fi taste',
          },
        ],
      },
      {
        service_id: 'hulu',
        service_name: 'Hulu',
        upcoming: [],
      },
    ]

    it('returns recommendations for each service', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              {
                type: 'text',
                text: JSON.stringify([
                  {
                    service_id: 'netflix',
                    verdict: 'keep',
                    top_matches: ['Stranger Things S5'],
                    reason: 'High-value content coming soon',
                  },
                  {
                    service_id: 'hulu',
                    verdict: 'pause',
                    top_matches: [],
                    reason: 'No upcoming content matches your taste',
                    resume_date: '2024-07-01',
                  },
                ] as Recommendation[]),
              },
            ],
          }),
      })

      global.fetch = mockFetch

      const result = await generateRecommendations('test-api-key', mockServiceContent)

      expect(result).toHaveLength(2)
      expect(result[0].service_id).toBe('netflix')
      expect(result[0].verdict).toBe('keep')
      expect(result[1].service_id).toBe('hulu')
      expect(result[1].verdict).toBe('pause')
    })

    it('calls Claude API with correct headers and body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [
              {
                type: 'text',
                text: JSON.stringify([]),
              },
            ],
          }),
      })

      global.fetch = mockFetch

      await generateRecommendations('my-api-key', mockServiceContent)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'my-api-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      )
    })

    it('throws error when API returns non-ok response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      global.fetch = mockFetch

      await expect(generateRecommendations('bad-key', mockServiceContent)).rejects.toThrow(
        'Claude API error: 401 Unauthorized'
      )
    })

    it('throws error when response format is invalid', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'not valid json' }],
          }),
      })

      global.fetch = mockFetch

      await expect(generateRecommendations('test-key', mockServiceContent)).rejects.toThrow(
        'Invalid response format from Claude'
      )
    })
  })
})
