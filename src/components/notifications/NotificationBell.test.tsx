import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationBell } from './NotificationBell'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          notifications: [
            {
              id: 'notif-1',
              user_id: 'user-123',
              type: 'content_release',
              title: 'New show',
              body: 'Coming soon',
              data: null,
              read: false,
              created_at: new Date().toISOString(),
            },
          ],
          unread_count: 1,
        }),
    })
  })

  it('renders bell icon', async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
    })
  })

  it('shows unread badge when there are unread notifications', async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('hides badge when there are no unread notifications', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          notifications: [],
          unread_count: 0,
        }),
    })

    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument()
    })
  })

  it('toggles dropdown on click', async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
    })

    // Click to open dropdown
    fireEvent.click(screen.getByLabelText('Notifications'))

    await waitFor(() => {
      expect(screen.getByText('New show')).toBeInTheDocument()
    })

    // Click again to close dropdown
    fireEvent.click(screen.getByLabelText('Notifications'))

    await waitFor(() => {
      expect(screen.queryByText('New show')).not.toBeInTheDocument()
    })
  })

  it('fetches notifications on mount', async () => {
    render(<NotificationBell />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notifications')
    })
  })
})
