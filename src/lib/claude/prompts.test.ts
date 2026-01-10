import { describe, it, expect } from 'vitest'
import { buildRecommendationPrompt, parseRecommendationResponse } from './prompts'
import type { ServiceContent } from '@/lib/types/content'

describe('Prompt Templates', () => {
  describe('buildRecommendationPrompt', () => {
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
    ]

    it('includes system instructions for subscription optimization', () => {
      const prompt = buildRecommendationPrompt(mockServiceContent)
      expect(prompt).toContain('subscription optimization')
    })

    it('includes service content data', () => {
      const prompt = buildRecommendationPrompt(mockServiceContent)
      expect(prompt).toContain('netflix')
      expect(prompt).toContain('Netflix')
      expect(prompt).toContain('Stranger Things S5')
    })

    it('specifies expected JSON response format', () => {
      const prompt = buildRecommendationPrompt(mockServiceContent)
      expect(prompt).toContain('service_id')
      expect(prompt).toContain('verdict')
      expect(prompt).toContain('keep')
      expect(prompt).toContain('pause')
      expect(prompt).toContain('consider')
    })

    it('mentions resume_date for pause recommendations', () => {
      const prompt = buildRecommendationPrompt(mockServiceContent)
      expect(prompt).toContain('resume_date')
    })

    it('instructs to return only JSON', () => {
      const prompt = buildRecommendationPrompt(mockServiceContent)
      expect(prompt).toMatch(/return\s+(only|ONLY)/i)
      expect(prompt).toContain('JSON')
    })
  })

  describe('parseRecommendationResponse', () => {
    it('parses valid JSON array of recommendations', () => {
      const validResponse = JSON.stringify([
        {
          service_id: 'netflix',
          verdict: 'keep',
          top_matches: ['Title 1'],
          reason: 'Good content',
        },
      ])

      const result = parseRecommendationResponse(validResponse)
      expect(result).toHaveLength(1)
      expect(result[0].service_id).toBe('netflix')
      expect(result[0].verdict).toBe('keep')
    })

    it('handles JSON with surrounding text', () => {
      const responseWithText = `Here are my recommendations:
[{"service_id": "netflix", "verdict": "keep", "top_matches": [], "reason": "test"}]
That's my analysis.`

      const result = parseRecommendationResponse(responseWithText)
      expect(result).toHaveLength(1)
      expect(result[0].service_id).toBe('netflix')
    })

    it('throws error for invalid JSON', () => {
      expect(() => parseRecommendationResponse('not json at all')).toThrow(
        'Failed to parse recommendations'
      )
    })

    it('validates recommendation structure', () => {
      const invalidStructure = JSON.stringify([
        { wrong_field: 'value' },
      ])

      expect(() => parseRecommendationResponse(invalidStructure)).toThrow(
        'Invalid recommendation format'
      )
    })

    it('accepts valid verdict values', () => {
      const recommendations = [
        { service_id: 'a', verdict: 'keep', top_matches: [], reason: 'r' },
        { service_id: 'b', verdict: 'pause', top_matches: [], reason: 'r', resume_date: '2024-01-01' },
        { service_id: 'c', verdict: 'consider', top_matches: [], reason: 'r' },
      ]

      const result = parseRecommendationResponse(JSON.stringify(recommendations))
      expect(result).toHaveLength(3)
    })

    it('rejects invalid verdict values', () => {
      const invalidVerdict = JSON.stringify([
        { service_id: 'a', verdict: 'invalid', top_matches: [], reason: 'r' },
      ])

      expect(() => parseRecommendationResponse(invalidVerdict)).toThrow(
        'Invalid verdict'
      )
    })
  })
})
