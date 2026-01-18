'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface SetReminderModalProps {
  subscription: {
    id: string
    service_name: string
    status: 'active' | 'paused'
  }
  open: boolean
  onClose: () => void
  onSubmit: (data: { subscription_id: string; type: 'cancel' | 'resubscribe'; trigger_date: string }) => void
}

export function SetReminderModal({
  subscription,
  open,
  onClose,
  onSubmit,
}: SetReminderModalProps) {
  const [triggerDate, setTriggerDate] = useState('')

  // Infer reminder type based on subscription status
  const reminderType = subscription.status === 'active' ? 'cancel' : 'resubscribe'
  const reminderText = subscription.status === 'active'
    ? "We'll remind you to cancel"
    : "We'll remind you to resubscribe"

  // Get today's date in YYYY-MM-DD format for comparison
  const today = useMemo(() => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }, [])

  // Check if the selected date is in the past
  const isPastDate = triggerDate !== '' && triggerDate < today
  const isValidDate = triggerDate !== '' && !isPastDate

  const handleClose = () => {
    setTriggerDate('')
    onClose()
  }

  const handleSubmit = () => {
    if (!isValidDate) return

    onSubmit({
      subscription_id: subscription.id,
      type: reminderType,
      trigger_date: triggerDate,
    })

    setTriggerDate('')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Set a reminder for {subscription.service_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{reminderText}</p>

          <div>
            <label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Date
            </label>
            <Input
              id="reminder-date"
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              min={today}
            />
            {isPastDate && (
              <p className="text-sm text-red-500 mt-1">Please select a future date</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidDate}>
            Set Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
