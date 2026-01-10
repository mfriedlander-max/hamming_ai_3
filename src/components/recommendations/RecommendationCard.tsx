'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecommendationBadge } from './RecommendationBadge'
import type { Recommendation } from '@/lib/types/content'

interface ServiceInfo {
  id: string
  name: string
  monthly_cost: number
}

interface RecommendationCardProps {
  recommendation: Recommendation
  service: ServiceInfo
  onPause: (serviceId: string, resumeDate?: string) => void
}

function formatDate(isoDate: string): string {
  // Parse as UTC to avoid timezone issues with date-only strings
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export function RecommendationCard({
  recommendation,
  service,
  onPause,
}: RecommendationCardProps) {
  const { verdict, top_matches, reason, resume_date } = recommendation
  const showPauseButton = verdict === 'pause' || verdict === 'consider'
  const hasTopMatches = top_matches.length > 0

  const handlePause = () => {
    onPause(service.id, resume_date)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <RecommendationBadge verdict={verdict} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">{reason}</p>

        {hasTopMatches && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Top Matches:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
              {top_matches.map((title, index) => (
                <li key={index}>{title}</li>
              ))}
            </ul>
          </div>
        )}

        {verdict === 'pause' && resume_date && (
          <p className="text-sm text-amber-700">
            Resume on {formatDate(resume_date)}
          </p>
        )}
      </CardContent>

      {showPauseButton && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="w-full"
          >
            Quick Pause
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
