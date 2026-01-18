'use client'

import { ContentMarker } from './ContentMarker'
import { getPositionInMonth } from '@/lib/calendar/utils'
import type { ContentRelease } from '@/lib/calendar/types'

export interface ServiceLaneProps {
  serviceId: string
  serviceName: string
  subscriptionId?: string
  releases: ContentRelease[]
  monthStart: string // "2026-01"
  onSelectRelease: (release: ContentRelease, serviceId: string, subscriptionId?: string) => void
}

export function ServiceLane({
  serviceId,
  serviceName,
  subscriptionId,
  releases,
  monthStart,
  onSelectRelease,
}: ServiceLaneProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Service name */}
      <div className="w-32 flex-shrink-0">
        <span className="text-sm font-medium text-foreground">{serviceName}</span>
      </div>

      {/* Timeline bar */}
      <div
        data-testid="timeline-bar"
        className="flex-1 h-8 bg-accent rounded-lg relative"
      >
        {releases.map((release) => {
          const position = getPositionInMonth(release.release_date, monthStart)
          return (
            <ContentMarker
              key={release.id}
              release={release}
              position={position}
              onClick={(r) => onSelectRelease(r, serviceId, subscriptionId)}
            />
          )
        })}
      </div>

      {/* Release count */}
      <div className="w-8 flex-shrink-0 text-center">
        {releases.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-gray-700">
            {releases.length}
          </span>
        )}
      </div>
    </div>
  )
}
