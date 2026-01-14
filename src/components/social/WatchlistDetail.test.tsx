import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchlistDetail } from './WatchlistDetail'
import type { WatchlistWithDetails } from '@/lib/social/types'

const mockWatchlist: WatchlistWithDetails = {
  id: 'wl-1',
  name: 'Must Watch Movies',
  created_by: 'user-123',
  created_at: '2026-01-10T00:00:00Z',
  members: [
    {
      watchlist_id: 'wl-1',
      user_id: 'user-123',
      role: 'owner',
      joined_at: '2026-01-10T00:00:00Z',
      user_name: 'John Doe',
      user_email: 'john@example.com',
    },
    {
      watchlist_id: 'wl-1',
      user_id: 'user-456',
      role: 'editor',
      joined_at: '2026-01-11T00:00:00Z',
      user_name: 'Jane Smith',
      user_email: 'jane@example.com',
    },
  ],
  items: [
    {
      id: 'item-1',
      watchlist_id: 'wl-1',
      tmdb_id: 550,
      content_type: 'movie',
      title: 'Fight Club',
      poster_path: '/poster1.jpg',
      added_by: 'user-123',
      added_at: '2026-01-11T00:00:00Z',
      added_by_name: 'John Doe',
    },
    {
      id: 'item-2',
      watchlist_id: 'wl-1',
      tmdb_id: 1399,
      content_type: 'tv',
      title: 'Game of Thrones',
      poster_path: null,
      added_by: 'user-456',
      added_at: '2026-01-12T00:00:00Z',
      added_by_name: 'Jane Smith',
    },
  ],
}

describe('WatchlistDetail', () => {
  it('renders watchlist name', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    expect(screen.getByText('Must Watch Movies')).toBeInTheDocument()
  })

  it('renders all items', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    expect(screen.getByText('Fight Club')).toBeInTheDocument()
    expect(screen.getByText('Game of Thrones')).toBeInTheDocument()
  })

  it('renders member avatars', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    // Should show member initials - both members have initial 'J'
    const initials = screen.getAllByText('J')
    expect(initials.length).toBeGreaterThan(0)
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={onBack}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    fireEvent.click(screen.getByLabelText(/back/i))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows remove button on items when user is owner/editor', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    const removeButtons = screen.getAllByLabelText(/remove/i)
    expect(removeButtons.length).toBeGreaterThan(0)
  })

  it('calls onRemoveItem when remove button is clicked', () => {
    const onRemoveItem = vi.fn()
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={onRemoveItem}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    const removeButtons = screen.getAllByLabelText(/remove/i)
    fireEvent.click(removeButtons[0])
    expect(onRemoveItem).toHaveBeenCalledWith('item-1')
  })

  it('shows invite button when user is owner', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
  })

  it('hides invite button when user is not owner', () => {
    render(
      <WatchlistDetail
        watchlist={mockWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner={false}
      />
    )

    expect(screen.queryByRole('button', { name: /invite/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    const emptyWatchlist = { ...mockWatchlist, items: [] }
    render(
      <WatchlistDetail
        watchlist={emptyWatchlist}
        onBack={vi.fn()}
        onRemoveItem={vi.fn()}
        onInviteMember={vi.fn()}
        isOwner
      />
    )

    expect(screen.getByText(/no items yet/i)).toBeInTheDocument()
  })
})
