import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubscriptionList } from './SubscriptionList'
import type { SubscriptionWithService } from './types'

const mockSubscriptions: SubscriptionWithService[] = [
  {
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
  },
  {
    id: '2',
    user_id: 'user-1',
    service_id: 'service-2',
    status: 'paused',
    monthly_cost: 9.99,
    created_at: '2024-01-02T00:00:00Z',
    service: {
      id: 'service-2',
      name: 'Hulu',
      slug: 'hulu',
      logo_url: '/logos/hulu.png',
      default_price: 9.99,
      tmdb_provider_id: 15,
      cancel_url: 'https://hulu.com/cancel',
    },
  },
]

describe('SubscriptionList', () => {
  it('renders a grid of subscription cards', () => {
    render(
      <SubscriptionList
        subscriptions={mockSubscriptions}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        onAdd={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Hulu')).toBeInTheDocument()
  })

  it('renders Add Subscription button', () => {
    render(
      <SubscriptionList
        subscriptions={mockSubscriptions}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        onAdd={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByRole('button', { name: /add subscription/i })).toBeInTheDocument()
  })

  it('calls onAdd when Add Subscription button is clicked', () => {
    const onAdd = vi.fn()
    render(
      <SubscriptionList
        subscriptions={mockSubscriptions}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        onAdd={onAdd}
        loading={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /add subscription/i }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no subscriptions', () => {
    render(
      <SubscriptionList
        subscriptions={[]}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        onAdd={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByText(/no subscriptions yet/i)).toBeInTheDocument()
    expect(screen.getByText(/complete onboarding to add services/i)).toBeInTheDocument()
  })

  it('renders loading skeleton cards when loading', () => {
    render(
      <SubscriptionList
        subscriptions={[]}
        onStatusChange={vi.fn()}
        onSetReminder={vi.fn()}
        onAdd={vi.fn()}
        loading={true}
      />
    )

    // Check for skeleton cards (aria-label or test-id)
    const skeletons = screen.getAllByTestId('subscription-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('calls onStatusChange when subscription status is changed', () => {
    const onStatusChange = vi.fn()
    render(
      <SubscriptionList
        subscriptions={mockSubscriptions}
        onStatusChange={onStatusChange}
        onSetReminder={vi.fn()}
        onAdd={vi.fn()}
        loading={false}
      />
    )

    // Click Pause on Netflix (active subscription)
    const pauseButtons = screen.getAllByRole('button', { name: /pause/i })
    fireEvent.click(pauseButtons[0])
    expect(onStatusChange).toHaveBeenCalledWith('1', 'paused')
  })
})
