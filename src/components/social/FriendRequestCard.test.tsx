import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FriendRequestCard } from './FriendRequestCard'
import type { FriendRequest } from '@/lib/social/types'

const mockRequest: FriendRequest = {
  id: 'req-1',
  requester_id: 'user-456',
  requester_name: 'Jane Smith',
  created_at: '2026-01-10T10:00:00Z',
}

describe('FriendRequestCard', () => {
  it('renders requester name', () => {
    render(
      <FriendRequestCard request={mockRequest} onAccept={vi.fn()} onDecline={vi.fn()} />
    )
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders "Unknown" when name is null', () => {
    const requestWithoutName = { ...mockRequest, requester_name: null }
    render(
      <FriendRequestCard request={requestWithoutName} onAccept={vi.fn()} onDecline={vi.fn()} />
    )
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('renders Accept and Decline buttons', () => {
    render(
      <FriendRequestCard request={mockRequest} onAccept={vi.fn()} onDecline={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })

  it('calls onAccept when Accept button is clicked', () => {
    const onAccept = vi.fn()
    render(
      <FriendRequestCard request={mockRequest} onAccept={onAccept} onDecline={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    expect(onAccept).toHaveBeenCalledWith('req-1')
  })

  it('calls onDecline when Decline button is clicked', () => {
    const onDecline = vi.fn()
    render(
      <FriendRequestCard request={mockRequest} onAccept={vi.fn()} onDecline={onDecline} />
    )

    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    expect(onDecline).toHaveBeenCalledWith('req-1')
  })

  it('disables buttons when processing', () => {
    render(
      <FriendRequestCard
        request={mockRequest}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        isProcessing
      />
    )

    expect(screen.getByRole('button', { name: /accept/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /decline/i })).toBeDisabled()
  })
})
