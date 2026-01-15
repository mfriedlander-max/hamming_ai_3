'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { BoardColumn } from './BoardColumn'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import type { BoardColumn as BoardColumnType, SubscriptionWithService } from '@/components/subscriptions/types'
import type { SubscriptionStatus } from '@/components/subscriptions/StatusBadge'

interface SubscriptionBoardProps {
  subscriptions: SubscriptionWithService[]
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  onBoardColumnChange: (id: string, column: BoardColumnType) => Promise<void>
  onCancel?: (id: string) => void
}

const COLUMNS: { id: BoardColumnType; title: string }[] = [
  { id: 'active', title: 'Active' },
  { id: 'consider', title: 'Consider Canceling' },
  { id: 'paused', title: 'Paused' },
  { id: 'scheduled', title: 'Scheduled' },
]

export function SubscriptionBoard({
  subscriptions,
  onStatusChange,
  onSetReminder,
  onBoardColumnChange,
  onCancel,
}: SubscriptionBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localSubscriptions, setLocalSubscriptions] = useState(subscriptions)

  // Update local state when props change
  if (subscriptions !== localSubscriptions && activeId === null) {
    setLocalSubscriptions(subscriptions)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const getSubscriptionsByColumn = useCallback(
    (columnId: BoardColumnType) => {
      return localSubscriptions.filter(
        (sub) => (sub.board_column || 'active') === columnId
      )
    },
    [localSubscriptions]
  )

  const getColumnTotal = useCallback(
    (columnId: BoardColumnType) => {
      return getSubscriptionsByColumn(columnId).reduce(
        (sum, sub) => sum + sub.monthly_cost,
        0
      )
    },
    [getSubscriptionsByColumn]
  )

  const activeSubscription = activeId
    ? localSubscriptions.find((sub) => sub.id === activeId)
    : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const activeSubId = active.id as string
    const overColumn = over.id as BoardColumnType

    // Find the subscription
    const subscription = localSubscriptions.find((sub) => sub.id === activeSubId)
    if (!subscription) return

    // Check if it's a valid column drop (not over another subscription)
    if (!COLUMNS.some((col) => col.id === overColumn)) return

    // Get current column
    const currentColumn = subscription.board_column || 'active'

    // If dropped in same column, do nothing
    if (currentColumn === overColumn) return

    // Optimistic update
    setLocalSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === activeSubId ? { ...sub, board_column: overColumn } : sub
      )
    )

    // Call API
    try {
      await onBoardColumnChange(activeSubId, overColumn)
    } catch {
      // Revert on error
      setLocalSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === activeSubId ? { ...sub, board_column: currentColumn } : sub
        )
      )
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        data-testid="subscription-board"
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
      >
        {COLUMNS.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.title}
            subscriptions={getSubscriptionsByColumn(column.id)}
            totalCost={getColumnTotal(column.id)}
            onStatusChange={onStatusChange}
            onSetReminder={onSetReminder}
            onCancel={onCancel}
          />
        ))}
      </div>

      <DragOverlay>
        {activeSubscription ? (
          <div className="opacity-80 shadow-2xl">
            <SubscriptionCard
              subscription={activeSubscription}
              onStatusChange={() => {}}
              onSetReminder={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
