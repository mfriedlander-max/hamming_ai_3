'use client'

import { useState, useCallback } from 'react'
import { SubscriptionBoard } from '@/components/board'
import { AddSubscriptionModal } from './AddSubscriptionModal'
import { SetReminderModal } from '@/components/reminders'
import { CancelSubscriptionModal } from './CancelSubscriptionModal'
import { useToast } from '@/components/ui/toast'
import { ErrorBanner } from '@/components/ui/error-banner'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService, Service, BoardColumn } from './types'

interface DashboardClientProps {
  initialSubscriptions: SubscriptionWithService[]
  availableServices: Service[]
}

export function DashboardClient({ initialSubscriptions, availableServices }: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithService[]>(initialSubscriptions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [selectedSubscriptionForReminder, setSelectedSubscriptionForReminder] = useState<SubscriptionWithService | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedSubscriptionForCancel, setSelectedSubscriptionForCancel] = useState<SubscriptionWithService | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Services that user doesn't have yet
  const unsubscribedServices = availableServices.filter(
    (service) => !subscriptions.some((sub) => sub.service_id === service.id)
  )

  const handleStatusChange = useCallback(async (id: string, status: SubscriptionStatus) => {
    setError(null)
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update subscription')
      }

      const updatedSubscription = await response.json()
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? updatedSubscription : sub))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating subscription status:', err)
    }
  }, [])

  const handleSetReminder = useCallback((id: string) => {
    const subscription = subscriptions.find((sub) => sub.id === id)
    if (subscription) {
      setSelectedSubscriptionForReminder(subscription)
      setReminderModalOpen(true)
    }
  }, [subscriptions])

  const handleReminderSubmit = useCallback(
    async (data: { subscription_id: string; type: 'cancel' | 'resubscribe'; trigger_date: string }) => {
      try {
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create reminder')
        }

        toast({
          message: 'Reminder set successfully!',
          type: 'success',
        })
        setReminderModalOpen(false)
        setSelectedSubscriptionForReminder(null)
      } catch (err) {
        toast({
          message: err instanceof Error ? err.message : 'Failed to create reminder',
          type: 'error',
        })
      }
    },
    [toast]
  )

  const handleAddSubscription = useCallback(
    async (data: { service_id: string; monthly_cost: number }) => {
      setError(null)
      try {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to add subscription')
        }

        const newSubscription = await response.json()
        setSubscriptions((prev) => [newSubscription, ...prev])
        setIsAddModalOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error adding subscription:', err)
      }
    },
    []
  )

  const handleRetry = useCallback(() => {
    setError(null)
  }, [])

  const handleBoardColumnChange = useCallback(async (id: string, column: BoardColumn) => {
    setError(null)
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_column: column }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update subscription')
      }

      const updatedSubscription = await response.json()
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? updatedSubscription : sub))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        message: err instanceof Error ? err.message : 'Failed to move subscription',
        type: 'error',
      })
      throw err // Re-throw for optimistic update revert
    }
  }, [toast])

  const handleCancel = useCallback((id: string) => {
    const subscription = subscriptions.find((sub) => sub.id === id)
    if (subscription) {
      setSelectedSubscriptionForCancel(subscription)
      setCancelModalOpen(true)
    }
  }, [subscriptions])

  const handleCancelConfirm = useCallback(async (subscriptionId: string, markAsPaused: boolean) => {
    if (markAsPaused) {
      try {
        const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paused' }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update subscription')
        }

        const updatedSubscription = await response.json()
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? updatedSubscription : sub))
        )

        toast({
          message: 'Subscription marked as paused',
          type: 'success',
        })
      } catch (err) {
        toast({
          message: err instanceof Error ? err.message : 'Failed to update subscription',
          type: 'error',
        })
      }
    }
  }, [toast])

  return (
    <div>
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={handleRetry} />
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      <SubscriptionBoard
        subscriptions={subscriptions}
        onStatusChange={handleStatusChange}
        onSetReminder={handleSetReminder}
        onBoardColumnChange={handleBoardColumnChange}
        onCancel={handleCancel}
      />

      <AddSubscriptionModal
        services={unsubscribedServices}
        onAdd={handleAddSubscription}
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedSubscriptionForReminder && (
        <SetReminderModal
          subscription={{
            id: selectedSubscriptionForReminder.id,
            service_name: selectedSubscriptionForReminder.service.name,
            status: selectedSubscriptionForReminder.status,
          }}
          open={reminderModalOpen}
          onClose={() => {
            setReminderModalOpen(false)
            setSelectedSubscriptionForReminder(null)
          }}
          onSubmit={handleReminderSubmit}
        />
      )}

      <CancelSubscriptionModal
        open={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setSelectedSubscriptionForCancel(null)
        }}
        subscription={selectedSubscriptionForCancel ? {
          id: selectedSubscriptionForCancel.id,
          service: {
            name: selectedSubscriptionForCancel.service.name,
            cancel_url: selectedSubscriptionForCancel.service.cancel_url,
          },
        } : null}
        onConfirm={handleCancelConfirm}
      />
    </div>
  )
}
