'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, type SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService } from './types'

interface SubscriptionCardProps {
  subscription: SubscriptionWithService
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  recommendationBadge?: ReactNode
}

export function SubscriptionCard({
  subscription,
  onStatusChange,
  onSetReminder,
  recommendationBadge,
}: SubscriptionCardProps) {
  const { id, status, monthly_cost, service } = subscription
  const isActive = status === 'active'

  const handleStatusToggle = () => {
    onStatusChange(id, isActive ? 'paused' : 'active')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <div className="flex items-center gap-2">
            {recommendationBadge}
            <StatusBadge status={status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-gray-900">
          ${monthly_cost.toFixed(2)}
          <span className="text-sm font-normal text-gray-500">/mo</span>
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant={isActive ? 'outline' : 'default'}
          size="sm"
          onClick={handleStatusToggle}
        >
          {isActive ? 'Pause' : 'Resume'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetReminder(id)}
        >
          Set Reminder
        </Button>
      </CardFooter>
    </Card>
  )
}
