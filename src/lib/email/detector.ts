import type { DetectedSubscription } from './types'
import { GmailClient } from './gmail-client'
import { matchServiceFromEmails } from './patterns'

/**
 * Detect subscriptions from connected email account
 * Uses mock mode when no real Gmail credentials are configured
 */
export function detectSubscriptions(accessToken?: string): DetectedSubscription[] {
  const client = new GmailClient(accessToken)
  const emails = client.fetchEmails()

  return matchServiceFromEmails(emails)
}

/**
 * Filter out services the user already has subscriptions to
 */
export function filterExistingSubscriptions(
  detected: DetectedSubscription[],
  existingSlugs: string[]
): DetectedSubscription[] {
  const existingSet = new Set(existingSlugs.map(s => s.toLowerCase()))

  return detected.filter(
    sub => !existingSet.has(sub.service_slug.toLowerCase())
  )
}
