'use client'

import { ContentMarker } from './ContentMarker'
import { getPositionInMonth } from '@/lib/calendar/utils'
import type { ContentRelease } from '@/lib/calendar/types'

export interface ServiceLaneProps {
  serviceName: string
  releases: ContentRelease[]
  monthStart: string // "2026-01"
  onSelectRelease: (release: ContentRelease) => void
}

export function ServiceLane({
  serviceName,
  releases,
  monthStart,
  onSelectRelease,
}: ServiceLaneProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Service name */}
      <div className="w-32 flex-shrink-0">
        <span className="text-sm font-medium text-gray-900">{serviceName}</span>
      </div>

      {/* Timeline bar */}
      <div
        data-testid="timeline-bar"
        className="flex-1 h-8 bg-gray-100 rounded-lg relative"
      >
        {releases.map((release) => {
          const position = getPositionInMonth(release.release_date, monthStart)
          return (
            <ContentMarker
              key={release.id}
              release={release}
              position={position}
              onClick={onSelectRelease}
            />
          )
        })}
      </div>

      {/* Release count */}
      <div className="w-8 flex-shrink-0 text-center">
        {releases.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-medium text-gray-700">
            {releases.length}
          </span>
        )}
      </div>
    </div>
  )
}
