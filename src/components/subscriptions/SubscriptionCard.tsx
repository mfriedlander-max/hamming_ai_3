'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, type SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService } from './types'

interface SubscriptionCardProps {
  subscription: SubscriptionWithService
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  onCancel?: (id: string) => void
  recommendationBadge?: ReactNode
}

export function SubscriptionCard({
  subscription,
  onStatusChange,
  onSetReminder,
  onCancel,
  recommendationBadge,
}: SubscriptionCardProps) {
  const { id, status, monthly_cost, service } = subscription
  const isActive = status === 'active'
  const [logoError, setLogoError] = useState(false)

  const handleStatusToggle = () => {
    onStatusChange(id, isActive ? 'paused' : 'active')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoError ? (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                {service.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Image
                src={`/logos/${service.slug}.svg`}
                alt={service.name}
                width={32}
                height={32}
                className="rounded-full"
                onError={() => setLogoError(true)}
              />
            )}
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {recommendationBadge}
            <StatusBadge status={status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">
          ${monthly_cost.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
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
        {service.cancel_url && onCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onCancel(id)}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
