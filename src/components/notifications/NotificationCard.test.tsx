import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationCard } from './NotificationCard'
import type { Notification } from '@/lib/notifications/types'

const mockNotification: Notification = {
  id: 'notif-1',
  user_id: 'user-123',
  type: 'content_release',
  title: 'New show coming',
  body: 'Stranger Things S5 releases tomorrow',
  data: { content_title: 'Stranger Things S5', service_name: 'Netflix' },
  read: false,
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
}

describe('NotificationCard', () => {
  it('renders notification title and body', () => {
    render(<NotificationCard notification={mockNotification} onMarkRead={vi.fn()} onDismiss={vi.fn()} />)

    expect(screen.getByText('New show coming')).toBeInTheDocument()
    expect(screen.getByText('Stranger Things S5 releases tomorrow')).toBeInTheDocument()
  })

  it('shows relative time', () => {
    render(<NotificationCard notification={mockNotification} onMarkRead={vi.fn()} onDismiss={vi.fn()} />)

    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })

  it('shows unread indicator when notification is unread', () => {
    render(<NotificationCard notification={mockNotification} onMarkRead={vi.fn()} onDismiss={vi.fn()} />)

    // Unread notifications have bolder text
    const titleElement = screen.getByText('New show coming')
    expect(titleElement).toHaveClass('font-semibold')
  })

  it('calls onMarkRead when clicked', () => {
    const onMarkRead = vi.fn()
    render(<NotificationCard notification={mockNotification} onMarkRead={onMarkRead} onDismiss={vi.fn()} />)

    // Click on the card
    fireEvent.click(screen.getByTestId('notification-card'))
    expect(onMarkRead).toHaveBeenCalledWith('notif-1')
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<NotificationCard notification={mockNotification} onMarkRead={vi.fn()} onDismiss={onDismiss} />)

    // Click dismiss button
    fireEvent.click(screen.getByLabelText('Dismiss notification'))
    expect(onDismiss).toHaveBeenCalledWith('notif-1')
  })

  it('renders correct icon for content_release type', () => {
    render(<NotificationCard notification={mockNotification} onMarkRead={vi.fn()} onDismiss={vi.fn()} />)

    // The icon should be present (Film icon for content_release)
    expect(screen.getByTestId('notification-icon')).toBeInTheDocument()
  })

  it('renders correct icon for pause_suggestion type', () => {
    const pauseNotification = { ...mockNotification, type: 'pause_suggestion' as const }
    render(<NotificationCard notification={pauseNotification} onMarkRead={vi.fn()} onDismiss={vi.fn()} />)

    expect(screen.getByTestId('notification-icon')).toBeInTheDocument()
  })
})
