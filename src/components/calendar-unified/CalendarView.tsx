'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, Film, Tv } from 'lucide-react'
import type { CalendarSubscriptionWindow } from '@/lib/optimizer-v2/types'

type SubscriptionWindow = CalendarSubscriptionWindow

interface ContentRelease {
  id: string
  title: string
  release_date: string
  service_id: string
  service_name: string
  type: 'movie' | 'series'
  taste_match_score: number
}

interface CalendarViewProps {
  windows: SubscriptionWindow[]
  releases: ContentRelease[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onSelectRelease: (release: ContentRelease) => void
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getPositionPercentage(day: number, daysInMonth: number): number {
  return ((day - 1) / daysInMonth) * 100
}

function getWidthPercentage(startDay: number, endDay: number, daysInMonth: number): number {
  return ((endDay - startDay + 1) / daysInMonth) * 100
}

export function CalendarView({
  windows,
  releases,
  currentMonth,
  onMonthChange,
  onSelectRelease,
}: CalendarViewProps) {
  const daysInMonth = getDaysInMonth(currentMonth)
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), daysInMonth)

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    onMonthChange(prev)
  }

  const handleNextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    onMonthChange(next)
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  // Group releases by service
  const releasesByService = releases.reduce<Record<string, ContentRelease[]>>((acc, release) => {
    const serviceId = release.service_id
    if (!acc[serviceId]) {
      acc[serviceId] = []
    }
    acc[serviceId].push(release)
    return acc
  }, {})

  // Calculate window positions for current month
  const getWindowDays = (window: SubscriptionWindow) => {
    const windowStart = new Date(window.start_date)
    const windowEnd = new Date(window.end_date)

    const effectiveStart = windowStart < monthStart ? monthStart : windowStart
    const effectiveEnd = windowEnd > monthEnd ? monthEnd : windowEnd

    if (effectiveStart > monthEnd || effectiveEnd < monthStart) {
      return null // Window not visible this month
    }

    const startDay = effectiveStart.getDate()
    const endDay = effectiveEnd.getDate()

    return { startDay, endDay }
  }

  // Generate day labels
  const dayLabels = [1, 8, 15, 22, daysInMonth]

  const hasWindows = windows.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-32 text-center font-medium">
              {formatMonth(currentMonth)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasWindows ? (
          <div className="space-y-4">
            {/* Day labels */}
            <div className="relative h-6 border-b">
              {dayLabels.map((day) => (
                <span
                  key={day}
                  className="absolute text-xs text-gray-500 -translate-x-1/2"
                  style={{ left: `${getPositionPercentage(day, daysInMonth)}%` }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Service lanes */}
            {windows.map((window) => {
              const days = getWindowDays(window)
              const serviceReleases = releasesByService[window.service_id] || []

              return (
                <div
                  key={window.service_id}
                  data-testid={`lane-${window.service_id}`}
                  className="relative h-16 border-b last:border-b-0"
                >
                  {/* Service label */}
                  <div className="absolute left-0 top-0 text-sm font-medium text-gray-700 z-10">
                    {window.service_name}
                  </div>

                  {/* Subscription window bar */}
                  {days && (
                    <div
                      data-testid={`window-${window.service_id}`}
                      className={`absolute top-6 h-4 rounded ${
                        window.is_currently_subscribed
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      } opacity-60`}
                      style={{
                        left: `${getPositionPercentage(days.startDay, daysInMonth)}%`,
                        width: `${getWidthPercentage(days.startDay, days.endDay, daysInMonth)}%`,
                      }}
                      title={`${window.service_name}: ${window.start_date} - ${window.end_date}`}
                    />
                  )}

                  {/* Release markers */}
                  {serviceReleases.map((release) => {
                    const releaseDate = new Date(release.release_date)
                    if (
                      releaseDate < monthStart ||
                      releaseDate > monthEnd
                    ) {
                      return null
                    }

                    const day = releaseDate.getDate()

                    return (
                      <button
                        key={release.id}
                        className="absolute top-8 flex items-center gap-1 bg-white border rounded px-1 py-0.5 text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer z-20"
                        style={{
                          left: `${getPositionPercentage(day, daysInMonth)}%`,
                          transform: 'translateX(-50%)',
                        }}
                        onClick={() => onSelectRelease(release)}
                      >
                        {release.type === 'movie' ? (
                          <Film className="h-3 w-3 text-purple-500" />
                        ) : (
                          <Tv className="h-3 w-3 text-blue-500" />
                        )}
                        <span className="max-w-20 truncate">{release.title}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No subscription windows</p>
            <p className="text-sm">Generate an optimizer plan to see your schedule</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
