'use client'

import { NotificationCard } from './NotificationCard'
import type { Notification } from '@/lib/notifications/types'

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
}

export function NotificationDropdown({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
}: NotificationDropdownProps) {
  return (
    <div className="w-80 bg-card rounded-lg shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
