import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OptimizerClient } from './OptimizerClient'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('OptimizerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders generate button initially', () => {
    render(<OptimizerClient />)

    expect(screen.getByText(/Generate Optimized Plan/i)).toBeInTheDocument()
  })

  it('shows loading state when generating', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    expect(screen.getByText(/Generating/i)).toBeInTheDocument()
  })

  it('displays schedule after successful generation', async () => {
    const mockSchedule = {
      current_annual_cost: 191.88,
      optimized_annual_cost: 95.94,
      savings: 95.94,
      months: [
        {
          month: '2026-01',
          actions: [],
          active_services: ['svc-1'],
          monthly_cost: 15.99,
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ schedule: mockSchedule, cached: false }),
    })

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/\$191\.88/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Save \$95\.94/)).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to generate' }),
    })

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/Failed/i)).toBeInTheDocument()
    })
  })

  it('shows Apply Plan button after generation', async () => {
    const mockSchedule = {
      current_annual_cost: 100,
      optimized_annual_cost: 50,
      savings: 50,
      months: [],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ schedule: mockSchedule, cached: false }),
    })

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/Apply Plan/i)).toBeInTheDocument()
    })
  })

  it('shows Regenerate button after generation', async () => {
    const mockSchedule = {
      current_annual_cost: 100,
      optimized_annual_cost: 50,
      savings: 50,
      months: [],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ schedule: mockSchedule, cached: false }),
    })

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/Regenerate/i)).toBeInTheDocument()
    })
  })

  it('applies plan when Apply Plan is clicked', async () => {
    const mockSchedule = {
      current_annual_cost: 100,
      optimized_annual_cost: 50,
      savings: 50,
      months: [],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ schedule: mockSchedule, cached: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ reminders_created: 2, subscriptions_updated: 1 }),
      })

    render(<OptimizerClient />)

    fireEvent.click(screen.getByText(/Generate Optimized Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/Apply Plan/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/Apply Plan/i))

    await waitFor(() => {
      expect(screen.getByText(/applied/i)).toBeInTheDocument()
    })
  })
})
