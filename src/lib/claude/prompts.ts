import type { ServiceContent, Recommendation } from '@/lib/types/content'

export function buildRecommendationPrompt(serviceContent: ServiceContent[]): string {
  return `You are a subscription optimization assistant. Analyze the following streaming services and their upcoming content matches for a user.

For each service, determine if the user should:
- "keep": High-value content coming that matches their taste
- "pause": No relevant content in the next 30 days
- "consider": Some matches but not compelling enough to justify cost

Return a JSON array of recommendations with this exact format:
[
  {
    "service_id": "string",
    "verdict": "keep" | "pause" | "consider",
    "top_matches": ["title1", "title2", "title3"],
    "reason": "Brief explanation",
    "resume_date": "YYYY-MM-DD" // only for pause recommendations
  }
]

Service content data:
${JSON.stringify(serviceContent, null, 2)}

Return ONLY the JSON array, no additional text.`
}

const VALID_VERDICTS = ['keep', 'pause', 'consider'] as const

export function parseRecommendationResponse(response: string): Recommendation[] {
  // Try to extract JSON array from response
  const jsonMatch = response.match(/\[[\s\S]*\]/)

  if (!jsonMatch) {
    throw new Error('Failed to parse recommendations: No JSON array found')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Failed to parse recommendations: Invalid JSON')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Failed to parse recommendations: Expected array')
  }

  // Validate each recommendation
  const recommendations: Recommendation[] = parsed.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Invalid recommendation format at index ${index}`)
    }

    const rec = item as Record<string, unknown>

    if (typeof rec.service_id !== 'string') {
      throw new Error(`Invalid recommendation format: missing service_id at index ${index}`)
    }

    if (!VALID_VERDICTS.includes(rec.verdict as typeof VALID_VERDICTS[number])) {
      throw new Error(`Invalid verdict "${rec.verdict}" at index ${index}`)
    }

    if (!Array.isArray(rec.top_matches)) {
      throw new Error(`Invalid recommendation format: missing top_matches at index ${index}`)
    }

    if (typeof rec.reason !== 'string') {
      throw new Error(`Invalid recommendation format: missing reason at index ${index}`)
    }

    return {
      service_id: rec.service_id,
      verdict: rec.verdict as Recommendation['verdict'],
      top_matches: rec.top_matches as string[],
      reason: rec.reason,
      resume_date: typeof rec.resume_date === 'string' ? rec.resume_date : undefined,
    }
  })

  return recommendations
}
