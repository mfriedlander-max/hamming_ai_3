'use client'

import { Activity, Play, Pause, RotateCw, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatActivityMessage } from '@/lib/social/activity'
import { formatRelativeTime } from '@/lib/notifications/generator'
import type { ActivityItem, ActivityAction } from '@/lib/social/types'

interface ActivityFeedProps {
  activities: ActivityItem[]
  hasMore: boolean
  onLoadMore: () => void
  isLoading?: boolean
  isLoadingMore?: boolean
}

const actionIcons: Record<ActivityAction, typeof Play> = {
  subscribed: Play,
  paused: Pause,
  resumed: RotateCw,
  cancelled: XCircle,
}

const actionColors: Record<ActivityAction, string> = {
  subscribed: 'text-green-500 bg-green-100',
  paused: 'text-amber-500 bg-amber-100',
  resumed: 'text-blue-500 bg-blue-100',
  cancelled: 'text-red-500 bg-red-100',
}

function LoadingSkeleton() {
  return (
    <div data-testid="activity-loading" className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className="w-8 h-8 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-48 mb-2" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({
  activities,
  hasMore,
  onLoadMore,
  isLoading = false,
  isLoadingMore = false,
}: ActivityFeedProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-muted-foreground">No activity yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Activity from your friends will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action]
        const colorClass = actionColors[activity.action]
        const message = formatActivityMessage(
          activity.action,
          activity.service_name,
          activity.user_name
        )

        return (
          <div
            key={activity.id}
            data-testid="activity-item"
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className={`flex-shrink-0 p-2 rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        )
      })}

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
