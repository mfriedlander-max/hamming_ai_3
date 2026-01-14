import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddFriendModal } from './AddFriendModal'

describe('AddFriendModal', () => {
  it('renders when open', async () => {
    render(
      <AddFriendModal open={true} onClose={vi.fn()} onSendRequest={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /add friend/i })).toBeInTheDocument()
    })
  })

  it('does not render when closed', () => {
    render(
      <AddFriendModal open={false} onClose={vi.fn()} onSendRequest={vi.fn()} />
    )

    expect(screen.queryByRole('heading', { name: /add friend/i })).not.toBeInTheDocument()
  })

  it('renders email input', async () => {
    render(
      <AddFriendModal open={true} onClose={vi.fn()} onSendRequest={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  it('calls onSendRequest with email when form is submitted', async () => {
    const onSendRequest = vi.fn().mockResolvedValue(undefined)
    render(
      <AddFriendModal open={true} onClose={vi.fn()} onSendRequest={onSendRequest} />
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'friend@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(onSendRequest).toHaveBeenCalledWith('friend@example.com')
    })
  })

  it('disables submit when email is empty', async () => {
    render(
      <AddFriendModal open={true} onClose={vi.fn()} onSendRequest={vi.fn()} />
    )

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /send request/i })
      expect(submitButton).toBeDisabled()
    })
  })

  it('shows loading state when sending', async () => {
    const onSendRequest = vi.fn().mockImplementation(() => new Promise(() => {}))
    render(
      <AddFriendModal open={true} onClose={vi.fn()} onSendRequest={onSendRequest} />
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'friend@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })

  it('shows error message when provided', async () => {
    render(
      <AddFriendModal
        open={true}
        onClose={vi.fn()}
        onSendRequest={vi.fn()}
        error="User not found"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })

  it('clears input after successful submission', async () => {
    const onSendRequest = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <AddFriendModal open={true} onClose={onClose} onSendRequest={onSendRequest} />
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'friend@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
