import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VacationMode } from './VacationMode'

// Mock fetch
global.fetch = vi.fn()

// Mock toast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('VacationMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders vacation toggle switch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        is_on_vacation: false,
        start_date: null,
        return_date: null,
        days_remaining: null,
      }),
    } as Response)

    render(<VacationMode />)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })

  it('shows date picker when enabled', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        is_on_vacation: true,
        start_date: '2026-01-15',
        return_date: '2026-01-25',
        days_remaining: 8,
      }),
    } as Response)

    render(<VacationMode />)

    await waitFor(() => {
      expect(screen.getByText(/return date/i)).toBeInTheDocument()
    })
  })

  it('calls enable/disable API on toggle', async () => {
    // Initial fetch - not on vacation
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        is_on_vacation: false,
        start_date: null,
        return_date: null,
        days_remaining: null,
      }),
    } as Response)

    // Enable vacation response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<VacationMode />)

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/vacation-mode',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  it('shows current vacation status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        is_on_vacation: true,
        start_date: '2026-01-15',
        return_date: '2026-01-25',
        days_remaining: 8,
      }),
    } as Response)

    render(<VacationMode />)

    await waitFor(() => {
      expect(screen.getByText(/vacation mode is on/i)).toBeInTheDocument()
    })
  })

  it('displays days remaining when on vacation', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        is_on_vacation: true,
        start_date: '2026-01-15',
        return_date: '2026-01-25',
        days_remaining: 8,
      }),
    } as Response)

    render(<VacationMode />)

    await waitFor(() => {
      expect(screen.getByText(/8 days remaining/i)).toBeInTheDocument()
    })
  })
})
