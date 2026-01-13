import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BingeClient } from './BingeClient'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      if (key === 'tmdb_id') return '12345'
      if (key === 'service_id') return 'service-123'
      if (key === 'release_date') return '2026-02-01'
      return null
    }),
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockPlan = {
  show_id: 12345,
  show_title: 'Test Show',
  service_id: 'service-123',
  service_name: 'Netflix',
  total_episodes: 10,
  total_hours: 8,
  days_to_complete: 5,
  subscribe_date: '2026-01-31',
  cancel_date: '2026-02-08',
  estimated_cost: 15.99,
  watch_speed: 2,
  poster_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
}

describe('BingeClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially when URL params are present', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ plan: mockPlan }),
    })

    render(<BingeClient defaultWatchSpeed={2} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays binge plan after fetching', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ plan: mockPlan }),
    })

    render(<BingeClient defaultWatchSpeed={2} />)

    await waitFor(() => {
      expect(screen.getByText('Test Show')).toBeInTheDocument()
    })

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/10 episodes/)).toBeInTheDocument()
  })

  it('shows error message on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to generate plan' }),
    })

    render(<BingeClient defaultWatchSpeed={2} />)

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument()
    })
  })

  it('recalculates plan when watch speed changes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ plan: mockPlan }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            plan: { ...mockPlan, watch_speed: 4, days_to_complete: 3 },
          }),
      })

    render(<BingeClient defaultWatchSpeed={2} />)

    await waitFor(() => {
      expect(screen.getByText('Test Show')).toBeInTheDocument()
    })

    // Change watch speed
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('creates reminders when Set Reminders is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ plan: mockPlan }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    render(<BingeClient defaultWatchSpeed={2} />)

    await waitFor(() => {
      expect(screen.getByText('Test Show')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /set reminders/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/reminders',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('shows success message after reminders are set', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ plan: mockPlan }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'reminder-1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'reminder-2' }),
      })

    render(<BingeClient defaultWatchSpeed={2} />)

    await waitFor(() => {
      expect(screen.getByText('Test Show')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /set reminders/i }))

    await waitFor(() => {
      expect(screen.getByText(/reminders set/i)).toBeInTheDocument()
    })
  })
})
