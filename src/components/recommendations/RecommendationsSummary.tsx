'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Recommendation } from '@/lib/types/content'

interface ServiceInfo {
  id: string
  name: string
  monthly_cost: number
}

interface RecommendationsSummaryProps {
  recommendations: Recommendation[]
  services: ServiceInfo[]
  onRefresh: () => void
  isLoading: boolean
}

export function RecommendationsSummary({
  recommendations,
  services,
  onRefresh,
  isLoading,
}: RecommendationsSummaryProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">No recommendations available. Click refresh to generate.</p>
            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate potential savings from pause recommendations
  const pauseRecs = recommendations.filter((r) => r.verdict === 'pause')
  const pauseServiceIds = new Set(pauseRecs.map((r) => r.service_id))
  const pauseServices = services.filter((s) => pauseServiceIds.has(s.id))
  const potentialSavings = pauseServices.reduce((sum, s) => sum + s.monthly_cost, 0)
  const pauseCount = pauseServices.length

  const hasSavings = potentialSavings > 0

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div>
            {hasSavings ? (
              <p className="text-lg">
                <span className="font-semibold text-green-600">
                  Save ${potentialSavings.toFixed(2)}/mo
                </span>{' '}
                by pausing {pauseCount} {pauseCount === 1 ? 'service' : 'services'}
              </p>
            ) : (
              <p className="text-gray-500">No savings opportunities found. All your subscriptions are optimized!</p>
            )}
          </div>
          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
