import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { SocialClient } from './SocialClient'

// Mock fetch
global.fetch = vi.fn()

describe('SocialClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        friends: [],
        pending_requests: [],
      }),
    })
  })

  it('renders tab navigation', async () => {
    await act(async () => {
      render(<SocialClient />)
    })

    expect(screen.getByRole('tab', { name: /friends/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /watchlists/i })).toBeInTheDocument()
  })

  it('shows Friends tab by default', async () => {
    await act(async () => {
      render(<SocialClient />)
    })

    await waitFor(() => {
      const friendsTab = screen.getByRole('tab', { name: /friends/i })
      expect(friendsTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('has Activity tab available for clicking', async () => {
    await act(async () => {
      render(<SocialClient />)
    })

    const activityTab = screen.getByRole('tab', { name: /activity/i })
    expect(activityTab).toBeInTheDocument()
    expect(activityTab).not.toBeDisabled()
  })

  it('has Watchlists tab available for clicking', async () => {
    await act(async () => {
      render(<SocialClient />)
    })

    const watchlistsTab = screen.getByRole('tab', { name: /watchlists/i })
    expect(watchlistsTab).toBeInTheDocument()
    expect(watchlistsTab).not.toBeDisabled()
  })

  it('fetches friends data on mount', async () => {
    await act(async () => {
      render(<SocialClient />)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/friends')
    })
  })
})
