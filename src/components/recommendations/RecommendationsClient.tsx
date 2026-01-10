'use client'

import { useState, useEffect } from 'react'
import { RecommendationCard, RecommendationsSummary } from '.'
import { useToast } from '@/components/ui/toast'
import type { Recommendation } from '@/lib/types/content'

interface ServiceInfo {
  id: string
  name: string
  monthly_cost: number
}

interface RecommendationsClientProps {
  initialServices: ServiceInfo[]
}

export function RecommendationsClient({ initialServices }: RecommendationsClientProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRecommendations = async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const handleRefresh = () => {
    fetchRecommendations(true)
  }

  const handlePause = async (serviceId: string, resumeDate?: string) => {
    const service = initialServices.find((s) => s.id === serviceId)
    const serviceName = service?.name || 'Service'

    try {
      // Update subscription status to paused
      const response = await fetch(`/api/subscriptions/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      })

      if (!response.ok) {
        throw new Error('Failed to pause subscription')
      }

      // Show success toast with reminder info
      if (resumeDate) {
        const resumeDateFormatted = new Date(resumeDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })
        toast({
          message: `${serviceName} paused. Reminder set for ${resumeDateFormatted}.`,
          type: 'success',
        })
      } else {
        toast({
          message: `${serviceName} paused successfully.`,
          type: 'success',
        })
      }

      // TODO: Create reminder if resumeDate is provided (Phase 6)

      // Refresh recommendations
      await fetchRecommendations(true)
    } catch (err) {
      toast({
        message: `Failed to pause ${serviceName}. Please try again.`,
        type: 'error',
      })
      setError(err instanceof Error ? err.message : 'Failed to pause subscription')
    }
  }

  // Create a mapping of service_id to service info
  const serviceMap = new Map(initialServices.map((s) => [s.id, s]))

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchRecommendations()}
            className="mt-2 text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RecommendationsSummary
        recommendations={recommendations}
        services={initialServices}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => {
            const service = serviceMap.get(rec.service_id)
            if (!service) return null

            return (
              <RecommendationCard
                key={rec.service_id}
                recommendation={rec}
                service={service}
                onPause={handlePause}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No recommendations yet. Add some subscriptions to get started.</p>
        </div>
      )}
    </div>
  )
}
