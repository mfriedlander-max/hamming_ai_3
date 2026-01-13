'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceLane } from './ServiceLane'
import { ContentDetailModal } from './ContentDetailModal'
import {
  getCurrentMonthString,
  getPreviousMonth,
  getNextMonth,
  formatMonthDisplay,
} from '@/lib/calendar/utils'
import type { ContentRelease, CalendarMonth } from '@/lib/calendar/types'

interface SelectedContent {
  release: ContentRelease
  serviceId: string
}

export interface ContentCalendarProps {
  initialMonth?: string
}

export function ContentCalendar({ initialMonth }: ContentCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth ?? getCurrentMonthString()
  )
  const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(
    null
  )

  const fetchCalendarData = useCallback(async (monthStr: string) => {
    setLoading(true)
    setError(null)

    try {
      // Parse month string to get start and end dates
      const [year, month] = monthStr.split('-').map(Number)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`

      // Get last day of month
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const response = await fetch(
        `/api/calendar?start=${startDate}&end=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data')
      }

      const data = await response.json()

      // Find the month data we requested
      const monthData = data.months?.find(
        (m: CalendarMonth) => m.month === monthStr
      )
      setCalendarData(monthData ?? null)
    } catch (err) {
      console.error('Error fetching calendar:', err)
      setError('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendarData(currentMonth)
  }, [currentMonth, fetchCalendarData])

  const handlePrevMonth = () => {
    setCurrentMonth(getPreviousMonth(currentMonth))
  }

  const handleNextMonth = () => {
    setCurrentMonth(getNextMonth(currentMonth))
  }

  const handleToday = () => {
    setCurrentMonth(getCurrentMonthString())
  }

  const handleSelectRelease = (release: ContentRelease, serviceId: string) => {
    setSelectedContent({ release, serviceId })
  }

  const handleCloseModal = () => {
    setSelectedContent(null)
  }

  const handleSetReminder = (release: ContentRelease) => {
    // TODO: Implement reminder creation
    console.log('Set reminder for:', release.title)
    setSelectedContent(null)
  }

  const handlePlanBinge = (release: ContentRelease, serviceId: string) => {
    // Navigate to binge planner with query params
    const params = new URLSearchParams({
      tmdb_id: release.tmdb_id.toString(),
      service_id: serviceId,
      release_date: release.release_date,
    })
    router.push(`/binge?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading calendar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchCalendarData(currentMonth)}>
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state when no subscriptions
  if (!calendarData || calendarData.services.length === 0) {
    return (
      <div className="p-8">
        <header className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-xl font-semibold text-gray-900">
            {formatMonthDisplay(currentMonth)}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
        </header>

        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Subscriptions
          </h3>
          <p className="text-gray-500">
            Add streaming services to see upcoming content releases.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header with navigation */}
      <header className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold text-gray-900">
          {formatMonthDisplay(currentMonth)}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </header>

      {/* Day markers */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="w-32 flex-shrink-0" />
        <div className="flex-1 flex justify-between px-2">
          <span>1</span>
          <span>8</span>
          <span>15</span>
          <span>22</span>
          <span>31</span>
        </div>
        <div className="w-8 flex-shrink-0" />
      </div>

      {/* Service lanes */}
      <div className="space-y-4">
        {calendarData.services.map((service) => (
          <ServiceLane
            key={service.service_id}
            serviceId={service.service_id}
            serviceName={service.service_name}
            releases={service.releases}
            monthStart={currentMonth}
            onSelectRelease={handleSelectRelease}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Movie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>TV Show</span>
        </div>
      </div>

      {/* Content detail modal */}
      {selectedContent && (
        <ContentDetailModal
          release={selectedContent.release}
          serviceId={selectedContent.serviceId}
          onClose={handleCloseModal}
          onSetReminder={handleSetReminder}
          onPlanBinge={handlePlanBinge}
        />
      )}
    </div>
  )
}
