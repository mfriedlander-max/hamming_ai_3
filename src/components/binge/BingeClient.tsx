'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { WatchSpeedSlider } from './WatchSpeedSlider'
import { BingePlanCard } from './BingePlanCard'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { BingePlan } from '@/lib/binge/types'

interface BingeClientProps {
  defaultWatchSpeed: number
}

export function BingeClient({ defaultWatchSpeed }: BingeClientProps) {
  const searchParams = useSearchParams()
  const tmdbId = searchParams.get('tmdb_id')
  const serviceId = searchParams.get('service_id')
  const releaseDate = searchParams.get('release_date')

  const [watchSpeed, setWatchSpeed] = useState(defaultWatchSpeed)
  const [plan, setPlan] = useState<BingePlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reminderSuccess, setReminderSuccess] = useState(false)
  const [settingReminders, setSettingReminders] = useState(false)

  const fetchPlan = useCallback(async () => {
    if (!tmdbId || !serviceId || !releaseDate) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/binge/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: parseInt(tmdbId, 10),
          service_id: serviceId,
          release_date: releaseDate,
          watch_speed: watchSpeed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate binge plan')
      }

      setPlan(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }, [tmdbId, serviceId, releaseDate, watchSpeed])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const handleSetReminders = async (bingePlan: BingePlan) => {
    setSettingReminders(true)
    setReminderSuccess(false)

    try {
      // First, lookup subscription ID from service_id
      const subResponse = await fetch(`/api/subscriptions?service_id=${bingePlan.service_id}`)
      if (!subResponse.ok) {
        throw new Error('Failed to find subscription for this service')
      }
      const subscriptions = await subResponse.json()
      const subscription = subscriptions.find((s: { service_id: string }) => s.service_id === bingePlan.service_id)

      if (!subscription) {
        throw new Error('You need to subscribe to this service first to set reminders')
      }

      // Create subscribe reminder using actual subscription ID
      const subscribeResponse = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscription.id, // Use actual subscription ID
          type: 'resubscribe',
          trigger_date: bingePlan.subscribe_date,
        }),
      })

      if (!subscribeResponse.ok) {
        throw new Error('Failed to create subscribe reminder')
      }

      // Create cancel reminder using actual subscription ID
      const cancelResponse = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscription.id, // Use actual subscription ID
          type: 'cancel',
          trigger_date: bingePlan.cancel_date,
        }),
      })

      if (!cancelResponse.ok) {
        throw new Error('Failed to create cancel reminder')
      }

      setReminderSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set reminders')
    } finally {
      setSettingReminders(false)
    }
  }

  // No URL params - show instructions
  if (!tmdbId || !serviceId || !releaseDate) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">
            Select a show from the Content Calendar to plan your binge.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading && !plan) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Loading binge plan...</p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error && !plan) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Watch Speed Slider */}
      <Card>
        <CardContent className="pt-6">
          <WatchSpeedSlider value={watchSpeed} onChange={setWatchSpeed} />
        </CardContent>
      </Card>

      {/* Binge Plan */}
      {plan && (
        <BingePlanCard
          plan={plan}
          onSetReminders={handleSetReminders}
          loading={settingReminders}
        />
      )}

      {/* Success Message */}
      {reminderSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p>
                Reminders set! Check your{' '}
                <a href="/reminders" className="underline font-medium">
                  Reminders page
                </a>{' '}
                to see them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && plan && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
