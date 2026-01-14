import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityFeed } from './ActivityFeed'
import type { ActivityItem } from '@/lib/social/types'

const mockActivities: ActivityItem[] = [
  {
    id: 'a-1',
    user_id: 'user-456',
    user_name: 'John Doe',
    action: 'subscribed',
    service_id: 'service-1',
    service_name: 'Netflix',
    service_logo: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'a-2',
    user_id: 'user-789',
    user_name: 'Jane Smith',
    action: 'paused',
    service_id: 'service-2',
    service_name: 'Hulu',
    service_logo: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
]

describe('ActivityFeed', () => {
  it('renders activity items', () => {
    render(
      <ActivityFeed
        activities={mockActivities}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )

    expect(screen.getByText(/John Doe subscribed to Netflix/)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith paused Hulu/)).toBeInTheDocument()
  })

  it('renders relative timestamps', () => {
    render(
      <ActivityFeed
        activities={mockActivities}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )

    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument()
    expect(screen.getByText(/1 day ago/)).toBeInTheDocument()
  })

  it('shows Load More button when hasMore is true', () => {
    render(
      <ActivityFeed
        activities={mockActivities}
        hasMore={true}
        onLoadMore={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
  })

  it('calls onLoadMore when Load More is clicked', () => {
    const onLoadMore = vi.fn()
    render(
      <ActivityFeed
        activities={mockActivities}
        hasMore={true}
        onLoadMore={onLoadMore}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /load more/i }))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('hides Load More button when hasMore is false', () => {
    render(
      <ActivityFeed
        activities={mockActivities}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    render(
      <ActivityFeed
        activities={[]}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )

    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    render(
      <ActivityFeed
        activities={[]}
        hasMore={false}
        onLoadMore={vi.fn()}
        isLoading
      />
    )

    expect(screen.getByTestId('activity-loading')).toBeInTheDocument()
  })

  it('renders different icons for different actions', () => {
    const activitiesWithAllActions: ActivityItem[] = [
      { ...mockActivities[0], id: 'a-1', action: 'subscribed' },
      { ...mockActivities[0], id: 'a-2', action: 'paused' },
      { ...mockActivities[0], id: 'a-3', action: 'resumed' },
      { ...mockActivities[0], id: 'a-4', action: 'cancelled' },
    ]

    render(
      <ActivityFeed
        activities={activitiesWithAllActions}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )

    // All activities should be rendered
    expect(screen.getAllByTestId('activity-item')).toHaveLength(4)
  })
})
