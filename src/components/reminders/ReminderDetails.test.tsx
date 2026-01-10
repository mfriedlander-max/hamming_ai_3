import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReminderDetails } from './ReminderDetails'
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

describe('ReminderDetails', () => {
  it('renders nothing when reminders array is empty', () => {
    const { container } = render(
      <ReminderDetails reminders={[]} onDelete={vi.fn()} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows reminder details (service name, type, date)', () => {
    const reminder = createMockReminder()

    render(<ReminderDetails reminders={[reminder]} onDelete={vi.fn()} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
    expect(screen.getByText(/jan 20, 2024/i)).toBeInTheDocument()
  })

  it('shows multiple reminders', () => {
    const reminders: ReminderWithSubscription[] = [
      createMockReminder({
        id: 'reminder-1',
        subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
      }),
      createMockReminder({
        id: 'reminder-2',
        subscription_id: 'sub-2',
        subscription: { id: 'sub-2', service_name: 'Hulu', status: 'paused' },
        type: 'resubscribe',
      }),
      createMockReminder({
        id: 'reminder-3',
        subscription_id: 'sub-3',
        subscription: { id: 'sub-3', service_name: 'Disney+', status: 'active' },
      }),
    ]

    render(<ReminderDetails reminders={reminders} onDelete={vi.fn()} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Hulu')).toBeInTheDocument()
    expect(screen.getByText('Disney+')).toBeInTheDocument()
  })

  it('cancel reminder has amber/orange styling', () => {
    const reminder = createMockReminder({ type: 'cancel' })

    render(<ReminderDetails reminders={[reminder]} onDelete={vi.fn()} />)

    // Find the reminder type badge/indicator
    const cancelBadge = screen.getByText(/cancel/i)
    expect(cancelBadge).toHaveClass('bg-amber-100')
    expect(cancelBadge).toHaveClass('text-amber-800')
  })

  it('resubscribe reminder has green styling', () => {
    const reminder = createMockReminder({
      type: 'resubscribe',
      subscription: { id: 'sub-123', service_name: 'Netflix', status: 'paused' },
    })

    render(<ReminderDetails reminders={[reminder]} onDelete={vi.fn()} />)

    // Find the reminder type badge/indicator
    const resubscribeBadge = screen.getByText(/resubscribe/i)
    expect(resubscribeBadge).toHaveClass('bg-green-100')
    expect(resubscribeBadge).toHaveClass('text-green-800')
  })

  it('delete button calls onDelete with reminder id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const reminder = createMockReminder({ id: 'reminder-xyz' })

    render(<ReminderDetails reminders={[reminder]} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('reminder-xyz')
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('each reminder has its own delete button', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const reminders: ReminderWithSubscription[] = [
      createMockReminder({
        id: 'reminder-1',
        subscription: { id: 'sub-1', service_name: 'Netflix', status: 'active' },
      }),
      createMockReminder({
        id: 'reminder-2',
        subscription_id: 'sub-2',
        subscription: { id: 'sub-2', service_name: 'Hulu', status: 'paused' },
        type: 'resubscribe',
      }),
    ]

    render(<ReminderDetails reminders={reminders} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons).toHaveLength(2)

    // Click the second delete button
    await user.click(deleteButtons[1])
    expect(onDelete).toHaveBeenCalledWith('reminder-2')
  })
})
