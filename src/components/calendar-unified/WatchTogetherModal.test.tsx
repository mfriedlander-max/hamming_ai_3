import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchTogetherModal } from './WatchTogetherModal'
import type { FriendInfo } from '@/lib/social-integration/types'

const mockFriends: FriendInfo[] = [
  { id: 'friend-1', name: 'Alice', email: 'alice@test.com' },
  { id: 'friend-2', name: 'Bob', email: 'bob@test.com' },
  { id: 'friend-3', name: 'Carol', email: 'carol@test.com' },
]

describe('WatchTogetherModal', () => {
  it('renders friend selection checkboxes', () => {
    render(
      <WatchTogetherModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
        friends={mockFriends}
        contentTitle="Stranger Things"
      />
    )

    expect(screen.getByText('Invite Friends to Watch')).toBeInTheDocument()
    // Each checkbox label contains the friend name
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
  })

  it('submits with selected friends', () => {
    const onSubmit = vi.fn()
    render(
      <WatchTogetherModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={onSubmit}
        friends={mockFriends}
        contentTitle="Stranger Things"
      />
    )

    // Select Alice and Carol by clicking their checkboxes
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice/i })
    const carolCheckbox = screen.getByRole('checkbox', { name: /carol/i })
    fireEvent.click(aliceCheckbox)
    fireEvent.click(carolCheckbox)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        friend_ids: ['friend-1', 'friend-3'],
      })
    )
  })

  it('closes when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <WatchTogetherModal
        isOpen={true}
        onClose={onClose}
        onSubmit={() => {}}
        friends={mockFriends}
        contentTitle="Stranger Things"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
