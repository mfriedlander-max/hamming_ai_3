'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubscriptionCard } from './SubscriptionCard'
import type { SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService } from './types'
import { Plus } from 'lucide-react'

interface SubscriptionListProps {
  subscriptions: SubscriptionWithService[]
  onStatusChange: (id: string, status: SubscriptionStatus) => void
  onSetReminder: (id: string) => void
  onAdd: () => void
  loading: boolean
}

function SubscriptionSkeleton() {
  return (
    <Card data-testid="subscription-skeleton" className="animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-8 w-20 bg-muted rounded mb-4" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      </div>
    </Card>
  )
}

export function SubscriptionList({
  subscriptions,
  onStatusChange,
  onSetReminder,
  onAdd,
  loading,
}: SubscriptionListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SubscriptionSkeleton />
        <SubscriptionSkeleton />
        <SubscriptionSkeleton />
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No subscriptions yet.</p>
        <p className="text-gray-400 text-sm">Complete onboarding to add services.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onStatusChange={onStatusChange}
          onSetReminder={onSetReminder}
        />
      ))}
      <Card className="flex items-center justify-center min-h-[180px] border-dashed">
        <Button variant="ghost" onClick={onAdd} className="flex flex-col h-auto py-6">
          <Plus className="h-8 w-8 mb-2 text-gray-400" />
          <span>Add Subscription</span>
        </Button>
      </Card>
    </div>
  )
}
