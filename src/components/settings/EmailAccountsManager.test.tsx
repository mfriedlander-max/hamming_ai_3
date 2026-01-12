import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmailAccountsManager } from './EmailAccountsManager'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('EmailAccountsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Connect Gmail" button when no emails connected', () => {
    render(<EmailAccountsManager connectedEmails={[]} />)

    expect(screen.getByRole('button', { name: /connect gmail/i })).toBeInTheDocument()
  })

  it('renders connected email when provided', () => {
    const emails = [
      { id: 'email-1', email: 'user@gmail.com', provider: 'gmail' as const, created_at: '2024-01-01' },
    ]

    render(<EmailAccountsManager connectedEmails={emails} />)

    expect(screen.getByText('user@gmail.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('calls API to connect email in mock mode when Connect Gmail clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, email: 'mock@gmail.com' }),
    })

    render(<EmailAccountsManager connectedEmails={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /connect gmail/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/gmail', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mock: true }),
      }))
    })
  })

  it('shows "Connecting..." while connecting', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<EmailAccountsManager connectedEmails={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /connect gmail/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled()
    })
  })

  it('calls API to disconnect when Disconnect clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const emails = [
      { id: 'email-1', email: 'user@gmail.com', provider: 'gmail' as const, created_at: '2024-01-01' },
    ]

    render(<EmailAccountsManager connectedEmails={emails} />)

    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/gmail', expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ email_id: 'email-1' }),
      }))
    })
  })

  it('shows error message when connect fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Connection failed' }),
    })

    render(<EmailAccountsManager connectedEmails={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /connect gmail/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to connect/i)).toBeInTheDocument()
    })
  })

  it('calls onEmailsChange callback after successful connection', async () => {
    const onEmailsChange = vi.fn()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, email: 'new@gmail.com' }),
    })

    render(<EmailAccountsManager connectedEmails={[]} onEmailsChange={onEmailsChange} />)

    fireEvent.click(screen.getByRole('button', { name: /connect gmail/i }))

    await waitFor(() => {
      expect(onEmailsChange).toHaveBeenCalled()
    })
  })
})
