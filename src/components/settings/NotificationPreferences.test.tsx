import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationPreferences } from './NotificationPreferences'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useToast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('NotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          user_id: 'user-123',
          content_release: true,
          pause_suggestion: true,
          resubscribe_reminder: true,
          price_change: false,
        }),
    })
  })

  it('renders all preference toggles', async () => {
    render(<NotificationPreferences />)

    await waitFor(() => {
      expect(screen.getByText('Content Releases')).toBeInTheDocument()
      expect(screen.getByText('Pause Suggestions')).toBeInTheDocument()
      expect(screen.getByText('Resubscribe Reminders')).toBeInTheDocument()
      expect(screen.getByText('Price Changes')).toBeInTheDocument()
    })
  })

  it('loads preferences from API', async () => {
    render(<NotificationPreferences />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/preferences')
    })
  })

  it('shows correct initial toggle states', async () => {
    render(<NotificationPreferences />)

    await waitFor(() => {
      const toggles = screen.getAllByRole('switch')
      // First three should be checked (true), last one unchecked (false)
      expect(toggles[0]).toHaveAttribute('data-state', 'checked')
      expect(toggles[3]).toHaveAttribute('data-state', 'unchecked')
    })
  })

  it('updates preference when toggle is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user_id: 'user-123',
            content_release: true,
            pause_suggestion: true,
            resubscribe_reminder: true,
            price_change: false,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user_id: 'user-123',
            content_release: false,
            pause_suggestion: true,
            resubscribe_reminder: true,
            price_change: false,
          }),
      })

    render(<NotificationPreferences />)

    await waitFor(() => {
      expect(screen.getByText('Content Releases')).toBeInTheDocument()
    })

    const toggles = screen.getAllByRole('switch')
    fireEvent.click(toggles[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_release: false }),
      })
    })
  })

  it('shows toast on successful update', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user_id: 'user-123',
            content_release: true,
            pause_suggestion: true,
            resubscribe_reminder: true,
            price_change: false,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user_id: 'user-123',
            content_release: false,
            pause_suggestion: true,
            resubscribe_reminder: true,
            price_change: false,
          }),
      })

    render(<NotificationPreferences />)

    await waitFor(() => {
      expect(screen.getByText('Content Releases')).toBeInTheDocument()
    })

    const toggles = screen.getAllByRole('switch')
    fireEvent.click(toggles[0])

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        message: 'Preferences saved',
        type: 'success',
      })
    })
  })
})
