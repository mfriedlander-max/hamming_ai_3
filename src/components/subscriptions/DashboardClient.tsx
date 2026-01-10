'use client'

import { useState, useCallback } from 'react'
import { SubscriptionList } from './SubscriptionList'
import { AddSubscriptionModal } from './AddSubscriptionModal'
import { SetReminderModal } from '@/components/reminders'
import { useToast } from '@/components/ui/toast'
import { ErrorBanner } from '@/components/ui/error-banner'
import type { SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService, Service } from './types'

interface DashboardClientProps {
  initialSubscriptions: SubscriptionWithService[]
  availableServices: Service[]
}

export function DashboardClient({ initialSubscriptions, availableServices }: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithService[]>(initialSubscriptions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [selectedSubscriptionForReminder, setSelectedSubscriptionForReminder] = useState<SubscriptionWithService | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const loading = false // Can be used for refresh functionality later

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

  return (
    <div>
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={handleRetry} />
        </div>
      )}

      <SubscriptionList
        subscriptions={subscriptions}
        onStatusChange={handleStatusChange}
        onSetReminder={handleSetReminder}
        onAdd={() => setIsAddModalOpen(true)}
        loading={loading}
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
    </div>
  )
}
