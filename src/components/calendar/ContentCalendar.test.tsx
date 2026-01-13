import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContentCalendar } from './ContentCalendar'
import type { CalendarResponse } from '@/lib/calendar/types'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useToast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('ContentCalendar', () => {
  const mockCalendarData: CalendarResponse = {
    months: [
      {
        month: '2026-01',
        services: [
          {
            service_id: 'service-1',
            service_name: 'Netflix',
            releases: [
              {
                id: 'content-1',
                tmdb_id: 1001,
                title: 'Movie A',
                type: 'movie',
                release_date: '2026-01-15',
                poster_url: null,
                genres: ['Action'],
              },
            ],
          },
          {
            service_id: 'service-2',
            service_name: 'Disney+',
            releases: [],
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCalendarData),
    })
  })

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<ContentCalendar />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders month navigation with current month', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
  })

  it('renders service lanes for each subscribed service', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('Disney+')).toBeInTheDocument()
    })
  })

  it('navigates to previous month when left arrow is clicked', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })

    const prevButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(prevButton)

    // Should fetch new data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('navigates to next month when right arrow is clicked', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    // Should fetch new data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('shows Today button that navigates to current month', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    })
  })

  it('opens content detail modal when marker is clicked', async () => {
    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    // Click on the content marker
    const marker = screen.getByRole('button', { name: /Movie A/i })
    fireEvent.click(marker)

    // Modal should appear with content details
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Movie A')).toBeInTheDocument()
    })
  })

  it('shows empty state when no services are subscribed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ months: [] }),
    })

    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/no subscriptions/i)).toBeInTheDocument()
    })
  })

  it('shows error state when fetch fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch' }),
    })

    render(<ContentCalendar />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
