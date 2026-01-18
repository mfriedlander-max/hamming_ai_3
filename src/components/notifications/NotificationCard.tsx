'use client'

import { Film, PauseCircle, Bell, DollarSign, X } from 'lucide-react'
import type { Notification, NotificationType } from '@/lib/notifications/types'
import { formatRelativeTime } from '@/lib/notifications/generator'

interface NotificationCardProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}

const iconMap: Record<NotificationType, typeof Film> = {
  content_release: Film,
  pause_suggestion: PauseCircle,
  resubscribe_reminder: Bell,
  price_change: DollarSign,
}

const iconColorMap: Record<NotificationType, string> = {
  content_release: 'text-blue-500',
  pause_suggestion: 'text-amber-500',
  resubscribe_reminder: 'text-green-500',
  price_change: 'text-purple-500',
}

export function NotificationCard({ notification, onMarkRead, onDismiss }: NotificationCardProps) {
  const Icon = iconMap[notification.type]
  const iconColor = iconColorMap[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id)
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(notification.id)
  }

  return (
    <div
      role="article"
      data-testid="notification-card"
      className={`w-full text-left p-3 flex items-start gap-3 hover:bg-muted transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
    >
      <div className={`flex-shrink-0 p-2 rounded-full bg-accent ${iconColor}`} data-testid="notification-icon">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm text-foreground ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-1 rounded-full hover:bg-muted text-gray-400 hover:text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
