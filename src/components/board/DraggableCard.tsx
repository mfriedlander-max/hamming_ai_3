'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import type { SubscriptionWithService } from '@/components/subscriptions/types'
import type { SubscriptionStatus } from '@/components/subscriptions/StatusBadge'

interface DraggableCardProps {
  subscription: SubscriptionWithService
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  onCancel?: (id: string) => void
}

export function DraggableCard({
  subscription,
  onStatusChange,
  onSetReminder,
  onCancel,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: subscription.id,
    data: { subscription },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`draggable-card-${subscription.id}`}
      className={`touch-manipulation transition-shadow ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <SubscriptionCard
        subscription={subscription}
        onStatusChange={onStatusChange}
        onSetReminder={onSetReminder}
        onCancel={onCancel}
      />
    </div>
  )
}
