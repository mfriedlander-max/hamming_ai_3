'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReminderWithSubscription } from '@/lib/types/reminder'

export interface ReminderCalendarProps {
  reminders: ReminderWithSubscription[]
  selectedDate: string | null // ISO date string YYYY-MM-DD
  onDateSelect: (date: string) => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatDateString(year: number, month: number, day: number): string {
  const monthStr = String(month + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

export function ReminderCalendar({
  reminders,
  selectedDate,
  onDateSelect,
}: ReminderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Group reminders by date for the current month
  const remindersByDate = useMemo(() => {
    const map = new Map<string, ReminderWithSubscription[]>()

    reminders.forEach((reminder) => {
      const date = reminder.trigger_date
      if (!map.has(date)) {
        map.set(date, [])
      }
      map.get(date)!.push(reminder)
    })

    return map
  }, [reminders])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const handleDayClick = (day: number) => {
    const dateString = formatDateString(currentYear, currentMonth, day)
    const hasReminder = remindersByDate.has(dateString)

    if (hasReminder) {
      onDateSelect(dateString)
    }
  }

  // Generate calendar grid cells
  const calendarCells: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null)
  }

  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day)
  }

  return (
    <div className="w-full bg-card rounded-lg border">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
          className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-base sm:text-lg font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarCells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[44px] sm:min-h-[80px] p-1" />
          }

          const dateString = formatDateString(currentYear, currentMonth, day)
          const dayReminders = remindersByDate.get(dateString) || []
          const hasReminder = dayReminders.length > 0
          const isSelected = selectedDate === dateString

          return (
            <div
              key={day}
              data-testid={`calendar-day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[44px] sm:min-h-[80px] p-1 sm:p-2 border-b border-r
                ${hasReminder ? 'cursor-pointer hover:bg-muted' : ''}
                ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
              `}
            >
              <div className="text-xs sm:text-sm text-gray-700">{day}</div>

              {/* Reminder indicators */}
              <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                {dayReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    data-testid={`reminder-indicator-${reminder.id}`}
                    className={`
                      text-xs px-1 py-0.5 rounded truncate text-white
                      ${reminder.type === 'cancel' ? 'bg-amber-500' : 'bg-emerald-500'}
                    `}
                  >
                    {reminder.subscription.service_name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
