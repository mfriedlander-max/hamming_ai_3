'use client'

import { useState, useCallback, useMemo } from 'react'
import { ReminderCalendar, ReminderDetails } from '.'
import { useToast } from '@/components/ui/toast'
import type { ReminderWithSubscription } from '@/lib/types/reminder'

export interface RemindersClientProps {
  initialReminders: ReminderWithSubscription[]
}

export function RemindersClient({ initialReminders }: RemindersClientProps) {
  const [reminders, setReminders] = useState<ReminderWithSubscription[]>(initialReminders)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter reminders for the selected date
  const selectedDateReminders = useMemo(() => {
    if (!selectedDate) return []
    return reminders.filter((reminder) => reminder.trigger_date === selectedDate)
  }, [reminders, selectedDate])

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleDelete = useCallback(
    async (reminderId: string) => {
      // Store original reminders for rollback on error
      const originalReminders = [...reminders]
      const reminderToDelete = reminders.find((r) => r.id === reminderId)

      // Optimistic update - remove the reminder immediately
      setReminders((prev) => prev.filter((r) => r.id !== reminderId))

      try {
        const response = await fetch(`/api/reminders/${reminderId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          // Rollback on error
          setReminders(originalReminders)
          toast({
            message: 'Failed to delete reminder. Please try again.',
            type: 'error',
          })
          return
        }

        // Success toast
        toast({
          message: `Reminder deleted${reminderToDelete ? ` for ${reminderToDelete.subscription.service_name}` : ''}.`,
          type: 'success',
        })

        // Clear selected date if no more reminders for that date
        const remainingForDate = originalReminders.filter(
          (r) => r.id !== reminderId && r.trigger_date === selectedDate
        )
        if (remainingForDate.length === 0) {
          setSelectedDate(null)
        }
      } catch {
        // Rollback on error
        setReminders(originalReminders)
        toast({
          message: 'Failed to delete reminder. Please try again.',
          type: 'error',
        })
      }
    },
    [reminders, selectedDate, toast]
  )

  // Empty state
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No reminders</h3>
        <p className="text-muted-foreground">
          Set reminders from your subscription cards to get notified about upcoming actions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ReminderCalendar
        reminders={reminders}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {selectedDate && selectedDateReminders.length > 0 && (
        <ReminderDetails
          reminders={selectedDateReminders}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
