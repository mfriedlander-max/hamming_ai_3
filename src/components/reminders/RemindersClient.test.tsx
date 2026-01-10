import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { RemindersClient } from './RemindersClient'
import { ToastProvider } from '@/components/ui/toast'
import type { ReminderWithSubscription } from '@/lib/types/reminder'

const createMockReminder = (
  overrides: Partial<ReminderWithSubscription> = {}
): ReminderWithSubscription => ({
  id: 'reminder-1',
  user_id: 'user-123',
  subscription_id: 'sub-123',
  type: 'cancel',
  trigger_date: '2024-01-20',
  triggered: false,
  created_at: '2024-01-01T00:00:00Z',
  subscription: {
    id: 'sub-123',
    service_name: 'Netflix',
    status: 'active',
  },
  ...overrides,
})

// Helper to wrap components with ToastProvider
function renderWithToast(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('RemindersClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders calendar with reminders', () => {
      const reminders = [createMockReminder()]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Calendar should be present with month/year
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      // Reminder indicator should be visible
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    it('shows empty state when no reminders', () => {
      renderWithToast(<RemindersClient initialReminders={[]} />)

      // Should show empty state message
      expect(screen.getByText(/no reminders/i)).toBeInTheDocument()
    })
  })

  describe('Date Selection', () => {
    it('selecting date shows ReminderDetails for that date', () => {
      const reminders = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
        createMockReminder({
          id: 'reminder-2',
          trigger_date: '2024-01-25',
          subscription: { id: 'sub-2', service_name: 'Hulu', status: 'paused' },
          type: 'resubscribe',
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Initially, no reminder details should be showing
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()

      // Click on day 20 (which has Netflix reminder)
      const day20 = screen.getByTestId('calendar-day-20')
      fireEvent.click(day20)

      // ReminderDetails should show with delete button
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      // Should show the Netflix reminder details (not Hulu since it's on a different date)
      expect(screen.getByText(/jan 20, 2024/i)).toBeInTheDocument()
    })

    it('shows only reminders for the selected date', () => {
      const reminders = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
        createMockReminder({
          id: 'reminder-2',
          trigger_date: '2024-01-20',
          subscription: { id: 'sub-2', service_name: 'Disney+', status: 'active' },
        }),
        createMockReminder({
          id: 'reminder-3',
          trigger_date: '2024-01-25',
          subscription: { id: 'sub-3', service_name: 'Hulu', status: 'paused' },
          type: 'resubscribe',
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Click on day 20
      const day20 = screen.getByTestId('calendar-day-20')
      fireEvent.click(day20)

      // Should show 2 delete buttons (for Netflix and Disney+)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(2)
    })
  })

  describe('Delete Reminder', () => {
    it('delete calls API and removes reminder from list', async () => {
      // Use real timers for async tests
      vi.useRealTimers()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      global.fetch = mockFetch

      // Use current month date (January 2026)
      const reminders = [
        createMockReminder({
          id: 'reminder-xyz',
          trigger_date: '2026-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Click on day 20 to select it
      const day20 = screen.getByTestId('calendar-day-20')
      fireEvent.click(day20)

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      // Should call the DELETE API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/reminders/reminder-xyz',
          expect.objectContaining({ method: 'DELETE' })
        )
      })

      // Reminder should be removed from the list (optimistic update)
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
      })
    })

    it('shows toast on successful delete', async () => {
      // Use real timers for async tests
      vi.useRealTimers()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      global.fetch = mockFetch

      // Use current month date (January 2026)
      const reminders = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2026-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Click on day 20 to select it
      const day20 = screen.getByTestId('calendar-day-20')
      fireEvent.click(day20)

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      // Toast should appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Toast should contain success message about deleted reminder
      await waitFor(() => {
        expect(screen.getByText(/reminder deleted/i)).toBeInTheDocument()
      })
    })

    it('shows error toast when delete fails', async () => {
      // Use real timers for async tests
      vi.useRealTimers()

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to delete' }),
      })
      global.fetch = mockFetch

      // Use current month date (January 2026)
      const reminders = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2026-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Click on day 20 to select it
      const day20 = screen.getByTestId('calendar-day-20')
      fireEvent.click(day20)

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      // Error toast should appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText(/failed to delete/i)).toBeInTheDocument()
      })

      // Reminder should still be in the list (not removed on error)
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('Multiple Reminders', () => {
    it('handles multiple reminders across different dates', () => {
      const reminders = [
        createMockReminder({
          id: 'reminder-1',
          trigger_date: '2024-01-20',
          subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
        }),
        createMockReminder({
          id: 'reminder-2',
          trigger_date: '2024-01-25',
          subscription: { id: 'sub-2', service_name: 'Hulu', status: 'paused' },
          type: 'resubscribe',
        }),
      ]

      renderWithToast(<RemindersClient initialReminders={reminders} />)

      // Both reminders should show indicators in calendar
      expect(screen.getByTestId('reminder-indicator-reminder-1')).toBeInTheDocument()
      expect(screen.getByTestId('reminder-indicator-reminder-2')).toBeInTheDocument()

      // Click on day 25
      const day25 = screen.getByTestId('calendar-day-25')
      fireEvent.click(day25)

      // Should show Hulu reminder details
      expect(screen.getByText(/jan 25, 2024/i)).toBeInTheDocument()
    })
  })
})
