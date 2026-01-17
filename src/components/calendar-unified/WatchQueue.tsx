'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Play, Plus, Users, Clock, AlertTriangle } from 'lucide-react'
import type { CalendarWatchSlot } from '@/lib/optimizer-v2/types'
import type { QueueHealth } from '@/lib/edge-cases/types'

type WatchSlot = CalendarWatchSlot

interface WatchQueueProps {
  slots: WatchSlot[]
  onRemove: (intentId: string) => void
  onPlanBinge: (slot: WatchSlot) => void
  onAddToWatchlist: (slot: WatchSlot) => void
  onWatchTogether?: (slot: WatchSlot) => void
  currentDate?: Date
  queueHealth?: QueueHealth | null
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isUrgent(deadline: string | undefined, currentDate: Date): boolean {
  if (!deadline) return false
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diffDays <= 3 && diffDays >= 0
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function WatchQueue({
  slots,
  onRemove,
  onPlanBinge,
  onAddToWatchlist,
  onWatchTogether,
  currentDate = new Date(),
  queueHealth,
}: WatchQueueProps) {
  const hasSlots = slots.length > 0
  const isOverloaded = queueHealth?.status === 'overloaded'
  const isWarning = queueHealth?.status === 'warning'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Watch Queue
          {hasSlots && (
            <Badge variant="secondary" className="ml-auto">
              {slots.length} items
            </Badge>
          )}
          {isOverloaded && (
            <Badge variant="destructive" className="ml-2" title={`${queueHealth.hours_deficit.toFixed(1)} hours over capacity`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overloaded
            </Badge>
          )}
          {isWarning && (
            <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Near Capacity
            </Badge>
          )}
        </CardTitle>
        {isOverloaded && queueHealth.hours_deficit > 0 && (
          <p className="text-sm text-red-600 mt-1">
            You need {queueHealth.hours_deficit.toFixed(1)} more hours than available to complete your queue.
            Consider removing some items.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {hasSlots ? (
          <ul className="space-y-3" role="list">
            {slots.map((slot) => {
              const urgent = isUrgent(slot.deadline, currentDate)
              const isFriendShare = slot.source === 'friend_share'
              const friendName = slot.source_details?.friend_name

              return (
                <li
                  key={slot.intent_id}
                  className={`p-3 rounded-lg border ${
                    urgent ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  role="listitem"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{slot.title}</span>
                        {isFriendShare && (
                          <Badge variant="outline" className="text-xs" data-testid="friend-share-badge">
                            <Users className="h-3 w-3 mr-1" />
                            {friendName ? `Shared by ${friendName}` : 'Shared by friend'}
                          </Badge>
                        )}
                        {urgent && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{slot.service_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(slot.duration_minutes)}
                        </span>
                        {slot.deadline && (
                          <span className={urgent ? 'text-amber-600 font-medium' : ''}>
                            Due: {formatDeadline(slot.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {isFriendShare && onWatchTogether && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onWatchTogether(slot)}
                          title="Watch together"
                          data-testid="watch-together-button"
                        >
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Watch Together</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddToWatchlist(slot)}
                        title="Add to watchlist"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add to watchlist</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlanBinge(slot)}
                        title="Plan binge"
                      >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Plan Binge</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(slot.intent_id)}
                        title="Remove from queue"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Play className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Your queue is empty</p>
            <p className="text-sm">Add content from Upcoming Releases to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
