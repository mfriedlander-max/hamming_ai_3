import type { CreateNotificationInput } from './types'

/**
 * Format a date string as "Mon D" (e.g., "Mar 15")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00Z')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Create a notification for upcoming content release
 */
export function createContentReleaseNotification(
  userId: string,
  contentTitle: string,
  serviceName: string,
  releaseDate: string
): CreateNotificationInput {
  return {
    user_id: userId,
    type: 'content_release',
    title: `${contentTitle} coming to ${serviceName}`,
    body: `Releasing on ${formatDate(releaseDate)}`,
    data: {
      content_title: contentTitle,
      service_name: serviceName,
      release_date: releaseDate,
    },
  }
}

/**
 * Create a notification confirming auto-reminder was set for resubscription
 */
export function createResubscribeNotification(
  userId: string,
  serviceName: string,
  subscriptionId: string,
  resumeDate?: string
): CreateNotificationInput {
  const body = resumeDate
    ? `We'll remind you to resubscribe to ${serviceName} on ${formatDate(resumeDate)}`
    : `We'll remind you to resubscribe to ${serviceName}`

  return {
    user_id: userId,
    type: 'resubscribe_reminder',
    title: 'Reminder Set',
    body,
    data: {
      subscription_id: subscriptionId,
      service_name: serviceName,
      ...(resumeDate && { resume_date: resumeDate }),
    },
  }
}

/**
 * Create a notification suggesting to pause a subscription
 */
export function createPauseSuggestionNotification(
  userId: string,
  serviceName: string,
  reason: string
): CreateNotificationInput {
  return {
    user_id: userId,
    type: 'pause_suggestion',
    title: `Consider pausing ${serviceName}`,
    body: reason,
    data: {
      service_name: serviceName,
      reason,
    },
  }
}

/**
 * Create a notification for price change
 */
export function createPriceChangeNotification(
  userId: string,
  serviceName: string,
  oldPrice: number,
  newPrice: number
): CreateNotificationInput {
  return {
    user_id: userId,
    type: 'price_change',
    title: `${serviceName} Price Change`,
    body: `Price changed from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}`,
    data: {
      service_name: serviceName,
      old_price: oldPrice,
      new_price: newPrice,
    },
  }
}

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diffMs = now - time

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Just now'
  }

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }

  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }

  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}
