import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InviteModal } from './InviteModal'

// Mock the clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}
Object.assign(navigator, { clipboard: mockClipboard })

describe('InviteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders invite code', () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('ABCD1234')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText(/invite/i)).toBeInTheDocument()
  })

  it('shows copy button', () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('copies invite code to clipboard when copy button is clicked', async () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /copy/i }))

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('ABCD1234')
    })
  })

  it('shows success message after copying', async () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /copy/i }))

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument()
    })
  })

  it('does not render when isOpen is false', () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={false} onClose={vi.fn()} />)

    expect(screen.queryByText('ABCD1234')).not.toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<InviteModal inviteCode="ABCD1234" isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /close modal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
