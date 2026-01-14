import type { ActivityAction } from './types'

/**
 * Format an activity message based on the action type
 */
export function formatActivityMessage(
  action: ActivityAction,
  serviceName: string,
  userName: string | null
): string {
  const displayName = userName ?? 'A friend'

  switch (action) {
    case 'subscribed':
      return `${displayName} subscribed to ${serviceName}`
    case 'paused':
      return `${displayName} paused ${serviceName}`
    case 'resumed':
      return `${displayName} resumed ${serviceName}`
    case 'cancelled':
      return `${displayName} cancelled ${serviceName}`
    default:
      return `${displayName} updated ${serviceName}`
  }
}
