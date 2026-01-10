import type { ServiceContent, Recommendation } from '@/lib/types/content'
import { buildRecommendationPrompt, parseRecommendationResponse } from './prompts'

export class ClaudeClient {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }
    this.apiKey = apiKey
  }

  getApiKey(): string {
    return this.apiKey
  }
}

export async function generateRecommendations(
  apiKey: string,
  serviceContent: ServiceContent[]
): Promise<Recommendation[]> {
  const prompt = buildRecommendationPrompt(serviceContent)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  try {
    const text = data.content[0].text
    return parseRecommendationResponse(text)
  } catch {
    throw new Error('Invalid response format from Claude')
  }
}
