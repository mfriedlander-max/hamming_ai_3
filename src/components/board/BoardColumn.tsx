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
}

export function BoardColumn({
  id,
  title,
  subscriptions,
  totalCost,
  onStatusChange,
  onSetReminder,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <Card
      ref={setNodeRef}
      data-testid={`board-column-${id}`}
      className={`board-column min-w-[85vw] md:min-w-[280px] flex-shrink-0 scroll-snap-align-start transition-colors ${
        isOver ? 'bg-accent/50' : ''
      }`}
    >
      <CardHeader className="pb-2">
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
      <CardContent className="space-y-3 min-h-[200px]">
        {subscriptions.map((subscription) => (
          <DraggableCard
            key={subscription.id}
            subscription={subscription}
            onStatusChange={onStatusChange}
            onSetReminder={onSetReminder}
          />
        ))}
        {subscriptions.length === 0 && (
          <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Drop subscriptions here
          </div>
        )}
      </CardContent>
    </Card>
  )
}
