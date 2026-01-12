import type { ServiceEmailPattern, DetectedSubscription } from './types'

// Email patterns for major streaming services
export const SERVICE_EMAIL_PATTERNS: ServiceEmailPattern[] = [
  {
    slug: 'netflix',
    name: 'Netflix',
    senderPatterns: [
      /^.*@netflix\.com$/i,
      /^.*@mailer\.netflix\.com$/i,
    ],
  },
  {
    slug: 'hulu',
    name: 'Hulu',
    senderPatterns: [
      /^.*@hulu\.com$/i,
      /^.*@email\.hulu\.com$/i,
    ],
  },
  {
    slug: 'disney-plus',
    name: 'Disney+',
    senderPatterns: [
      /^.*@disneyplus\.com$/i,
      /^.*@email\.disneyplus\.com$/i,
      /^.*@disney\.com$/i,
    ],
  },
  {
    slug: 'hbo-max',
    name: 'HBO Max',
    senderPatterns: [
      /^.*@hbomax\.com$/i,
      /^.*@mail\.hbomax\.com$/i,
      /^.*@max\.com$/i,
    ],
  },
  {
    slug: 'amazon-prime',
    name: 'Prime Video',
    senderPatterns: [
      /^.*@amazon\.com$/i,
      /^.*@primevideo\.com$/i,
    ],
    subjectPatterns: [
      /prime\s*video/i,
      /prime\s*membership/i,
    ],
  },
  {
    slug: 'apple-tv-plus',
    name: 'Apple TV+',
    senderPatterns: [
      /^.*@apple\.com$/i,
      /^.*@email\.apple\.com$/i,
    ],
    subjectPatterns: [
      /apple\s*tv\+?/i,
    ],
  },
  {
    slug: 'peacock',
    name: 'Peacock',
    senderPatterns: [
      /^.*@peacocktv\.com$/i,
      /^.*@email\.peacocktv\.com$/i,
    ],
  },
  {
    slug: 'paramount',
    name: 'Paramount+',
    senderPatterns: [
      /^.*@paramountplus\.com$/i,
      /^.*@paramount\.com$/i,
    ],
  },
  {
    slug: 'crunchyroll',
    name: 'Crunchyroll',
    senderPatterns: [
      /^.*@crunchyroll\.com$/i,
      /^.*@email\.crunchyroll\.com$/i,
    ],
  },
  {
    slug: 'discovery-plus',
    name: 'Discovery+',
    senderPatterns: [
      /^.*@discoveryplus\.com$/i,
      /^.*@discovery\.com$/i,
    ],
  },
]

interface EmailMatchResult {
  slug: string
  name: string
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Match a single email against service patterns
 */
export function matchServiceFromEmail(
  sender: string,
  subject: string
): EmailMatchResult | null {
  for (const pattern of SERVICE_EMAIL_PATTERNS) {
    // Check sender patterns
    const senderMatch = pattern.senderPatterns.some((regex) =>
      regex.test(sender)
    )

    if (senderMatch) {
      // For Amazon, also check subject to filter Prime Video from other Amazon emails
      if (pattern.subjectPatterns) {
        const subjectMatch = pattern.subjectPatterns.some((regex) =>
          regex.test(subject)
        )
        if (subjectMatch) {
          return {
            slug: pattern.slug,
            name: pattern.name,
            confidence: 'high',
          }
        }
        // Amazon email but no Prime Video subject match
        continue
      }

      return {
        slug: pattern.slug,
        name: pattern.name,
        confidence: 'high',
      }
    }
  }

  return null
}

interface EmailInput {
  sender: string
  subject: string
}

/**
 * Match multiple emails and return deduplicated detected subscriptions
 */
export function matchServiceFromEmails(
  emails: EmailInput[]
): DetectedSubscription[] {
  const detectedMap = new Map<string, DetectedSubscription>()

  for (const email of emails) {
    const match = matchServiceFromEmail(email.sender, email.subject)
    if (match && !detectedMap.has(match.slug)) {
      detectedMap.set(match.slug, {
        service_slug: match.slug,
        service_name: match.name,
        confidence: match.confidence,
        detected_from: email.sender,
      })
    }
  }

  return Array.from(detectedMap.values())
}
