import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FriendCard } from './FriendCard'
import type { Friend } from '@/lib/social/types'

const mockFriend: Friend = {
  id: 'f-1',
  user_id: 'user-456',
  name: 'John Doe',
  email: 'john@example.com',
  friends_since: '2026-01-01T00:00:00Z',
}

describe('FriendCard', () => {
  it('renders friend name', () => {
    render(<FriendCard friend={mockFriend} onRemove={vi.fn()} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders friend email when name is null', () => {
    const friendWithoutName = { ...mockFriend, name: null }
    render(<FriendCard friend={friendWithoutName} onRemove={vi.fn()} />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders "Friends since" date', () => {
    render(<FriendCard friend={mockFriend} onRemove={vi.fn()} />)
    expect(screen.getByText(/Friends since/)).toBeInTheDocument()
    // Check for date format (Mon YYYY)
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument()
  })

  it('renders avatar with initial', () => {
    render(<FriendCard friend={mockFriend} onRemove={vi.fn()} />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<FriendCard friend={mockFriend} onRemove={onRemove} />)

    fireEvent.click(screen.getByLabelText('Remove friend'))
    expect(onRemove).toHaveBeenCalledWith('f-1')
  })

  it('shows loading state when removing', () => {
    render(<FriendCard friend={mockFriend} onRemove={vi.fn()} isRemoving />)
    expect(screen.getByLabelText('Removing friend')).toBeInTheDocument()
  })
})
