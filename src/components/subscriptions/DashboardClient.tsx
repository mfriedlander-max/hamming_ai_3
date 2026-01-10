'use client'

import { useState, useCallback } from 'react'
import { SubscriptionList } from './SubscriptionList'
import { AddSubscriptionModal } from './AddSubscriptionModal'
import type { SubscriptionStatus } from './StatusBadge'
import type { SubscriptionWithService, Service } from './types'

interface DashboardClientProps {
  initialSubscriptions: SubscriptionWithService[]
  availableServices: Service[]
}

export function DashboardClient({ initialSubscriptions, availableServices }: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithService[]>(initialSubscriptions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    // Phase 6 functionality - currently disabled
    console.log('Set reminder for subscription:', id)
  }, [])

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

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
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
    </div>
  )
}
