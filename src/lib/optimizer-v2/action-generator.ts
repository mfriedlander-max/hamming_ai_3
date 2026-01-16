import type {
  SubscriptionWindow,
  UserSubscription,
  ThisWeekAction,
} from './types'

const WEEK_DAYS = 7

/**
 * Check if a date falls within this week (from today to 7 days out)
 */
function isThisWeek(dateStr: string): boolean {
  const now = new Date()
  const date = new Date(dateStr)
  const endOfWeek = new Date(now)
  endOfWeek.setDate(endOfWeek.getDate() + WEEK_DAYS)

  return date >= now && date <= endOfWeek
}

/**
 * Find subscription by service_id
 */
function findSubscription(
  serviceId: string,
  subscriptions: UserSubscription[]
): UserSubscription | undefined {
  return subscriptions.find((s) => s.service_id === serviceId)
}

/**
 * Generate actions for a single subscription window
 */
export function generateActionsForWindow(
  window: SubscriptionWindow,
  subscriptions: UserSubscription[]
): ThisWeekAction[] {
  const actions: ThisWeekAction[] = []
  const subscription = findSubscription(window.service_id, subscriptions)

  // Check if subscribe date is this week
  if (isThisWeek(window.subscribe_date)) {
    const actionType =
      subscription?.status === 'paused' ? 'resume' : 'subscribe'

    actions.push({
      type: actionType,
      service_id: window.service_id,
      service_name: window.service_name,
      date: window.subscribe_date,
      reason: `${actionType === 'resume' ? 'Resume' : 'Subscribe to'} ${window.service_name} to ${window.reason}`,
    })
  }

  // Check if cancel date is this week
  if (isThisWeek(window.cancel_date)) {
    const actionType =
      subscription?.status === 'active' ? 'pause' : 'cancel'

    actions.push({
      type: actionType,
      service_id: window.service_id,
      service_name: window.service_name,
      date: window.cancel_date,
      reason: `${actionType === 'pause' ? 'Pause' : 'Cancel'} ${window.service_name} - content watching complete`,
    })
  }

  return actions
}

/**
 * Generate all actions needed this week from subscription windows
 */
export function generateThisWeekActions(
  windows: SubscriptionWindow[],
  subscriptions: UserSubscription[]
): ThisWeekAction[] {
  const allActions: ThisWeekAction[] = []

  for (const window of windows) {
    const windowActions = generateActionsForWindow(window, subscriptions)
    allActions.push(...windowActions)
  }

  // Sort by date
  return allActions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
