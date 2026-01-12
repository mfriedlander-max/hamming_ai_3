import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SubscriptionDetector } from './SubscriptionDetector'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('SubscriptionDetector', () => {
  const defaultProps = {
    emailId: 'email-1',
    onSubscriptionsAdded: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders scan button', () => {
    render(<SubscriptionDetector {...defaultProps} />)

    expect(screen.getByRole('button', { name: /scan for subscriptions/i })).toBeInTheDocument()
  })

  it('calls detect API when scan button clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ detected: [] }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/detect', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email_id: 'email-1' }),
      }))
    })
  })

  it('shows "Scanning..." while scanning', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /scanning/i })).toBeDisabled()
    })
  })

  it('displays detected subscriptions as checkboxes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        detected: [
          { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
          { service_slug: 'hulu', service_name: 'Hulu', confidence: 'high', detected_from: 'no-reply@hulu.com' },
        ],
      }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /netflix/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /hulu/i })).toBeInTheDocument()
    })
  })

  it('shows "Add Selected" button when subscriptions detected', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        detected: [
          { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
        ],
      }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add selected/i })).toBeInTheDocument()
    })
  })

  it('allows selecting/deselecting subscriptions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        detected: [
          { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
        ],
      }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /netflix/i })
      expect(checkbox).toBeChecked() // Should be checked by default

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  it('calls subscriptions API to add selected services', async () => {
    // First call returns detected services
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        detected: [
          { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
        ],
      }),
    })

    // Second call for adding subscriptions
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /netflix/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions', expect.objectContaining({
        method: 'POST',
      }))
    })
  })

  it('shows "No new subscriptions found" when all are already added', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ detected: [] }),
    })

    render(<SubscriptionDetector {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByText(/no new subscriptions/i)).toBeInTheDocument()
    })
  })

  it('calls onSubscriptionsAdded after adding subscriptions', async () => {
    const onSubscriptionsAdded = vi.fn()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        detected: [
          { service_slug: 'netflix', service_name: 'Netflix', confidence: 'high', detected_from: 'info@netflix.com' },
        ],
      }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    render(<SubscriptionDetector {...defaultProps} onSubscriptionsAdded={onSubscriptionsAdded} />)

    fireEvent.click(screen.getByRole('button', { name: /scan for subscriptions/i }))

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /netflix/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /add selected/i }))

    await waitFor(() => {
      expect(onSubscriptionsAdded).toHaveBeenCalled()
    })
  })
})
