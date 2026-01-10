import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetReminderModal } from './SetReminderModal'

const mockActiveSubscription = {
  id: 'sub-123',
  service_name: 'Netflix',
  status: 'active' as const,
}

const mockPausedSubscription = {
  id: 'sub-456',
  service_name: 'Hulu',
  status: 'paused' as const,
}

describe('SetReminderModal', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent test behavior
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders modal when open is true', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: /set reminder/i })).toBeInTheDocument()
  })

  it('does not render modal when open is false', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.queryByRole('heading', { name: /set reminder/i })).not.toBeInTheDocument()
  })

  it('shows service name', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText(/netflix/i)).toBeInTheDocument()
  })

  it('shows "remind you to cancel" text for active subscription', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText(/we'll remind you to cancel/i)).toBeInTheDocument()
  })

  it('shows "remind you to resubscribe" text for paused subscription', () => {
    render(
      <SetReminderModal
        subscription={mockPausedSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText(/we'll remind you to resubscribe/i)).toBeInTheDocument()
  })

  it('has a date input', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/reminder date/i)).toBeInTheDocument()
  })

  it('disables submit button when no date is selected', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const submitButton = screen.getByRole('button', { name: /set reminder/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when past date is selected', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const dateInput = screen.getByLabelText(/reminder date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-10' } }) // Past date (before Jan 15)

    const submitButton = screen.getByRole('button', { name: /set reminder/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when future date is selected', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const dateInput = screen.getByLabelText(/reminder date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-20' } }) // Future date

    const submitButton = screen.getByRole('button', { name: /set reminder/i })
    expect(submitButton).toBeEnabled()
  })

  it('calls onSubmit with correct data for active subscription', () => {
    const onSubmit = vi.fn()

    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    const dateInput = screen.getByLabelText(/reminder date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-20' } })

    const submitButton = screen.getByRole('button', { name: /set reminder/i })
    fireEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith({
      subscription_id: 'sub-123',
      type: 'cancel',
      trigger_date: '2024-01-20',
    })
  })

  it('calls onSubmit with correct data for paused subscription', () => {
    const onSubmit = vi.fn()

    render(
      <SetReminderModal
        subscription={mockPausedSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    const dateInput = screen.getByLabelText(/reminder date/i)
    fireEvent.change(dateInput, { target: { value: '2024-02-01' } })

    const submitButton = screen.getByRole('button', { name: /set reminder/i })
    fireEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith({
      subscription_id: 'sub-456',
      type: 'resubscribe',
      trigger_date: '2024-02-01',
    })
  })

  it('calls onClose when Cancel button is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows validation message for past dates', () => {
    render(
      <SetReminderModal
        subscription={mockActiveSubscription}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )

    const dateInput = screen.getByLabelText(/reminder date/i)
    fireEvent.change(dateInput, { target: { value: '2024-01-10' } }) // Past date

    expect(screen.getByText(/please select a future date/i)).toBeInTheDocument()
  })
})
