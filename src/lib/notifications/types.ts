export type NotificationType =
  | 'content_release'
  | 'pause_suggestion'
  | 'resubscribe_reminder'
  | 'price_change'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface NotificationPreferences {
  user_id: string
  content_release: boolean
  pause_suggestion: boolean
  resubscribe_reminder: boolean
  price_change: boolean
}

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  body?: string
  data?: Record<string, unknown>
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}
