'use client'

import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DraggableCard } from './DraggableCard'
import type { BoardColumn as BoardColumnType, SubscriptionWithService } from '@/components/subscriptions/types'
import type { SubscriptionStatus } from '@/components/subscriptions/StatusBadge'

interface BoardColumnProps {
  id: BoardColumnType
  title: string
  subscriptions: SubscriptionWithService[]
  totalCost: number
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  onCancel?: (id: string) => void
}

export function BoardColumn({
  id,
  title,
  subscriptions,
  totalCost,
  onStatusChange,
  onSetReminder,
  onCancel,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <Card
      ref={setNodeRef}
      data-testid={`board-column-${id}`}
      className={`board-column flex flex-col transition-colors ${
        isOver ? 'bg-accent/50' : ''
      }`}
    >
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {subscriptions.length}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            ${totalCost.toFixed(2)}/mo
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-y-auto min-h-[120px]">
        {subscriptions.map((subscription) => (
          <DraggableCard
            key={subscription.id}
            subscription={subscription}
            onStatusChange={onStatusChange}
            onSetReminder={onSetReminder}
            onCancel={onCancel}
          />
        ))}
        {subscriptions.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[100px] text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Drop subscriptions here
          </div>
        )}
      </CardContent>
    </Card>
  )
}
