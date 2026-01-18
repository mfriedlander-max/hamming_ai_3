import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationDropdown } from './NotificationDropdown'
import type { Notification } from '@/lib/notifications/types'

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-123',
    type: 'content_release',
    title: 'New show',
    body: 'Coming soon',
    data: null,
    read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'user-123',
    type: 'pause_suggestion',
    title: 'Consider pausing',
    body: 'No content',
    data: null,
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

describe('NotificationDropdown', () => {
  it('renders notifications list', () => {
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('New show')).toBeInTheDocument()
    expect(screen.getByText('Consider pausing')).toBeInTheDocument()
  })

  it('shows empty state when no notifications', () => {
    render(
      <NotificationDropdown
        notifications={[]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('calls onMarkAllRead when button is clicked', () => {
    const onMarkAllRead = vi.fn()
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={onMarkAllRead}
        onDismiss={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Mark all read'))
    expect(onMarkAllRead).toHaveBeenCalled()
  })

  it('renders header with title', () => {
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('passes callbacks to NotificationCard', () => {
    const onMarkRead = vi.fn()
    const onDismiss = vi.fn()
    render(
      <NotificationDropdown
        notifications={mockNotifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
        onDismiss={onDismiss}
      />
    )

    // Click on a notification card
    fireEvent.click(screen.getAllByTestId('notification-card')[0])
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')

    // Click dismiss on a notification
    fireEvent.click(screen.getAllByLabelText('Dismiss notification')[0])
    expect(onDismiss).toHaveBeenCalledWith('notif-1')
  })

  it('has correct styling for dropdown panel', () => {
    const { container } = render(
      <NotificationDropdown
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    // Check that the dropdown has proper styling
    const dropdown = container.firstChild as HTMLElement
    expect(dropdown).toHaveClass('bg-card')
    expect(dropdown).toHaveClass('rounded-lg')
    expect(dropdown).toHaveClass('shadow-lg')
  })
})
