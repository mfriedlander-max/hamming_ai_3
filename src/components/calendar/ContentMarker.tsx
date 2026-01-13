'use client'

import { useState } from 'react'
import type { ContentRelease } from '@/lib/calendar/types'

export interface ContentMarkerProps {
  release: ContentRelease
  position: number // 0-1 position within the month
  onClick?: (release: ContentRelease) => void
}

export function ContentMarker({ release, position, onClick }: ContentMarkerProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Different colors for movies vs TV shows
  const bgColor = release.type === 'movie'
    ? 'bg-blue-500 hover:bg-blue-600'
    : 'bg-purple-500 hover:bg-purple-600'

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${position * 100}%` }}
    >
      <button
        type="button"
        className={`w-3 h-3 rounded-full ${bgColor} transition-colors cursor-pointer shadow-sm`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onClick?.(release)}
        aria-label={`${release.title} - ${formatDate(release.release_date)}`}
      />

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
            <div className="font-medium">{release.title}</div>
            <div className="text-gray-300">{formatDate(release.release_date)}</div>
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
        </div>
      )}
    </div>
  )
}
