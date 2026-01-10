import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReminderCalendar } from './ReminderCalendar'
import type { ReminderWithSubscription } from '@/lib/types/reminder'

const createMockReminder = (
  overrides: Partial<ReminderWithSubscription> = {}
): ReminderWithSubscription => ({
  id: 'reminder-1',
  user_id: 'user-1',
  subscription_id: 'sub-1',
  type: 'cancel',
  trigger_date: '2024-01-15',
  triggered: false,
  created_at: '2024-01-01T00:00:00Z',
  subscription: {
    id: 'sub-1',
    service_name: 'Netflix',
    status: 'active',
  },
  ...overrides,
})

describe('ReminderCalendar', () => {
  beforeEach(() => {
    // Mock the current date to January 15, 2024
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Calendar Grid Structure', () => {
    it('renders calendar grid with day headers (Sun-Sat)', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Tue')).toBeInTheDocument()
      expect(screen.getByText('Wed')).toBeInTheDocument()
      expect(screen.getByText('Thu')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
    })

    it('shows current month and year in header', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      expect(screen.getByText('January 2024')).toBeInTheDocument()
    })

    it('renders day cells for the month', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      // January 2024 has 31 days
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('31')).toBeInTheDocument()
    })
  })

  describe('Month Navigation', () => {
    it('navigates to previous month when clicking Previous button', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      const prevButton = screen.getByRole('button', { name: /previous/i })
      fireEvent.click(prevButton)

      expect(screen.getByText('December 2023')).toBeInTheDocument()
    })

    it('navigates to next month when clicking Next button', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      expect(screen.getByText('February 2024')).toBeInTheDocument()
    })
  })

  describe('Reminder Indicators', () => {
    it('shows reminder indicator on days with reminders', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-1',
            service_name: 'Netflix',
            status: 'active',
          },
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      // The day 20 should have a reminder indicator with service name
      const dayCell = screen.getByTestId('calendar-day-20')
      expect(dayCell).toHaveTextContent('Netflix')
    })

    it('uses amber/orange color for cancel reminders', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          type: 'cancel',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-1',
            service_name: 'Netflix',
            status: 'active',
          },
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      const indicator = screen.getByTestId('reminder-indicator-reminder-1')
      expect(indicator).toHaveClass('bg-amber-500')
    })

    it('uses green/blue color for resubscribe reminders', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          type: 'resubscribe',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-1',
            service_name: 'Hulu',
            status: 'paused',
          },
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      const indicator = screen.getByTestId('reminder-indicator-reminder-1')
      expect(indicator).toHaveClass('bg-emerald-500')
    })

    it('shows multiple reminders on the same day', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          type: 'cancel',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-1',
            service_name: 'Netflix',
            status: 'active',
          },
        }),
        createMockReminder({
          id: 'reminder-2',
          type: 'resubscribe',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-2',
            service_name: 'Hulu',
            status: 'paused',
          },
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      const dayCell = screen.getByTestId('calendar-day-20')
      expect(dayCell).toHaveTextContent('Netflix')
      expect(dayCell).toHaveTextContent('Hulu')
    })
  })

  describe('Date Selection', () => {
    it('calls onDateSelect when clicking a day with reminder', () => {
      const onDateSelect = vi.fn()
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={onDateSelect}
        />
      )

      const dayCell = screen.getByTestId('calendar-day-20')
      fireEvent.click(dayCell)

      expect(onDateSelect).toHaveBeenCalledWith('2024-01-20')
    })

    it('highlights selected date', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate="2024-01-20"
          onDateSelect={vi.fn()}
        />
      )

      const dayCell = screen.getByTestId('calendar-day-20')
      expect(dayCell).toHaveClass('ring-2')
    })

    it('does not call onDateSelect when clicking a day without reminder', () => {
      const onDateSelect = vi.fn()

      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={onDateSelect}
        />
      )

      const dayCell = screen.getByTestId('calendar-day-15')
      fireEvent.click(dayCell)

      expect(onDateSelect).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles reminders from different months correctly', () => {
      const reminders: ReminderWithSubscription[] = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
          subscription: {
            id: 'sub-1',
            service_name: 'Netflix',
            status: 'active',
          },
        }),
        createMockReminder({
          id: 'reminder-2',
          trigger_date: '2024-02-15',
          subscription: {
            id: 'sub-2',
            service_name: 'Hulu',
            status: 'paused',
          },
        }),
      ]

      render(
        <ReminderCalendar
          reminders={reminders}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      // Only January reminder should be visible
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.queryByText('Hulu')).not.toBeInTheDocument()

      // Navigate to February
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      // Now February reminder should be visible
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
      expect(screen.getByText('Hulu')).toBeInTheDocument()
    })

    it('renders correctly for months with different number of days', () => {
      render(
        <ReminderCalendar
          reminders={[]}
          selectedDate={null}
          onDateSelect={vi.fn()}
        />
      )

      // Navigate to February 2024 (leap year, has 29 days)
      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      expect(screen.getByText('February 2024')).toBeInTheDocument()
      expect(screen.getByText('29')).toBeInTheDocument()
    })
  })
})
