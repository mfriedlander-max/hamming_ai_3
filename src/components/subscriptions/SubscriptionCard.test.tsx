import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubscriptionCard } from './SubscriptionCard'
import type { SubscriptionWithService } from './types'

const mockActiveSubscription: SubscriptionWithService = {
  id: '1',
  user_id: 'user-1',
  service_id: 'service-1',
  status: 'active',
  monthly_cost: 15.99,
  created_at: '2024-01-01T00:00:00Z',
  service: {
    id: 'service-1',
    name: 'Netflix',
    slug: 'netflix',
    logo_url: '/logos/netflix.png',
    default_price: 15.99,
    tmdb_provider_id: 8,
    cancel_url: 'https://netflix.com/cancel',
  },
}

const mockPausedSubscription: SubscriptionWithService = {
  ...mockActiveSubscription,
  id: '2',
  status: 'paused',
}

describe('SubscriptionCard', () => {
  it('renders service name and price', () => {
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('$15.99')).toBeInTheDocument()
    expect(screen.getByText('/mo')).toBeInTheDocument()
  })

  it('renders active status badge when subscription is active', () => {
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders paused status badge when subscription is paused', () => {
    render(
      <SubscriptionCard
        subscription={mockPausedSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('renders Pause button when subscription is active', () => {
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /resume/i })).not.toBeInTheDocument()
  })

  it('renders Resume button when subscription is paused', () => {
    render(
      <SubscriptionCard
        subscription={mockPausedSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
  })

  it('calls onStatusChange with paused when Pause button is clicked', () => {
    const onStatusChange = vi.fn()
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={onStatusChange}
        onSetReminder={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(onStatusChange).toHaveBeenCalledWith('1', 'paused')
  })

  it('calls onStatusChange with active when Resume button is clicked', () => {
    const onStatusChange = vi.fn()
    render(
      <SubscriptionCard
        subscription={mockPausedSubscription}
        onStatusChange={onStatusChange}
        onSetReminder={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /resume/i }))
    expect(onStatusChange).toHaveBeenCalledWith('2', 'active')
  })

  it('renders Set Reminder button and calls onSetReminder when clicked', () => {
    const onSetReminder = vi.fn()
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={onSetReminder}
      />
    )

    const reminderButton = screen.getByRole('button', { name: /set reminder/i })
    expect(reminderButton).toBeInTheDocument()
    expect(reminderButton).not.toBeDisabled()

    fireEvent.click(reminderButton)
    expect(onSetReminder).toHaveBeenCalledWith('1')
  })

  it('renders recommendation badge when provided', () => {
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        recommendationBadge={<span data-testid="rec-badge">Keep</span>}
      />
    )

    expect(screen.getByTestId('rec-badge')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('does not render recommendation badge slot when not provided', () => {
    render(
      <SubscriptionCard
        subscription={mockActiveSubscription}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
      />
    )

    expect(screen.queryByTestId('rec-badge')).not.toBeInTheDocument()
  })
})
