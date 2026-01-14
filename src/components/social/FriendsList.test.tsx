import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FriendsList } from './FriendsList'
import type { Friend, FriendRequest } from '@/lib/social/types'

const mockFriends: Friend[] = [
  {
    id: 'f-1',
    user_id: 'user-456',
    name: 'John Doe',
    email: 'john@example.com',
    friends_since: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f-2',
    user_id: 'user-789',
    name: 'Jane Smith',
    email: 'jane@example.com',
    friends_since: '2026-01-05T00:00:00Z',
  },
]

const mockRequests: FriendRequest[] = [
  {
    id: 'req-1',
    requester_id: 'user-111',
    requester_name: 'Bob Wilson',
    requester_email: 'bob@example.com',
    created_at: '2026-01-10T00:00:00Z',
  },
]

describe('FriendsList', () => {
  it('renders friends grid', () => {
    render(
      <FriendsList
        friends={mockFriends}
        pendingRequests={[]}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={vi.fn()}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders pending requests section when there are requests', () => {
    render(
      <FriendsList
        friends={mockFriends}
        pendingRequests={mockRequests}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={vi.fn()}
      />
    )

    expect(screen.getByText(/Friend Requests/)).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
  })

  it('renders Add Friend button', () => {
    render(
      <FriendsList
        friends={mockFriends}
        pendingRequests={[]}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /add friend/i })).toBeInTheDocument()
  })

  it('calls onAddFriend when Add Friend button is clicked', () => {
    const onAddFriend = vi.fn()
    render(
      <FriendsList
        friends={mockFriends}
        pendingRequests={[]}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={onAddFriend}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /add friend/i }))
    expect(onAddFriend).toHaveBeenCalled()
  })

  it('shows empty state when no friends', () => {
    render(
      <FriendsList
        friends={[]}
        pendingRequests={[]}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={vi.fn()}
      />
    )

    expect(screen.getByText(/no friends yet/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    render(
      <FriendsList
        friends={[]}
        pendingRequests={[]}
        onRemove={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onAddFriend={vi.fn()}
        isLoading
      />
    )

    expect(screen.getByTestId('friends-loading')).toBeInTheDocument()
  })
})
