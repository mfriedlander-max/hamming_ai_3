'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Play, Plus, GripVertical, Users, Clock, AlertTriangle } from 'lucide-react'
import type { CalendarWatchSlot } from '@/lib/optimizer-v2/types'

interface DraggableQueueItemProps {
  slot: CalendarWatchSlot
  onRemove: (intentId: string) => void
  onPlanBinge: (slot: CalendarWatchSlot) => void
  onAddToWatchlist: (slot: CalendarWatchSlot) => void
  currentDate?: Date
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

export function DraggableQueueItem({
  slot,
  onRemove,
  onPlanBinge,
  onAddToWatchlist,
  currentDate = new Date(),
}: DraggableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.intent_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none' as const,
  }

  const urgent = isUrgent(slot.deadline, currentDate)
  const isFriendShare = slot.source === 'friend_share'

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border ${
        urgent ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
      } ${isDragging ? 'shadow-lg z-50' : ''}`}
      role="listitem"
    >
      <div className="flex items-start">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mr-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{slot.title}</span>
            {isFriendShare && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Shared by friend
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
}
