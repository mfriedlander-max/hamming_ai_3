import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchlistCard } from './WatchlistCard'
import type { Watchlist } from '@/lib/social/types'

const mockWatchlist: Watchlist = {
  id: 'wl-1',
  name: 'Must Watch Movies',
  created_by: 'user-123',
  created_at: '2026-01-10T00:00:00Z',
  member_count: 3,
  item_count: 12,
}

describe('WatchlistCard', () => {
  it('renders watchlist name', () => {
    render(<WatchlistCard watchlist={mockWatchlist} onClick={vi.fn()} />)
    expect(screen.getByText('Must Watch Movies')).toBeInTheDocument()
  })

  it('renders member count', () => {
    render(<WatchlistCard watchlist={mockWatchlist} onClick={vi.fn()} />)
    expect(screen.getByText(/3 members/i)).toBeInTheDocument()
  })

  it('renders item count', () => {
    render(<WatchlistCard watchlist={mockWatchlist} onClick={vi.fn()} />)
    expect(screen.getByText(/12 items/i)).toBeInTheDocument()
  })

  it('renders singular "member" for 1 member', () => {
    const singleMember = { ...mockWatchlist, member_count: 1 }
    render(<WatchlistCard watchlist={singleMember} onClick={vi.fn()} />)
    expect(screen.getByText(/1 member/i)).toBeInTheDocument()
  })

  it('renders singular "item" for 1 item', () => {
    const singleItem = { ...mockWatchlist, item_count: 1 }
    render(<WatchlistCard watchlist={singleItem} onClick={vi.fn()} />)
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<WatchlistCard watchlist={mockWatchlist} onClick={onClick} />)

    fireEvent.click(screen.getByText('Must Watch Movies'))
    expect(onClick).toHaveBeenCalledWith('wl-1')
  })

  it('shows delete button when onDelete is provided', () => {
    render(
      <WatchlistCard
        watchlist={mockWatchlist}
        onClick={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/delete/i)).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <WatchlistCard
        watchlist={mockWatchlist}
        onClick={vi.fn()}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByLabelText(/delete/i))
    expect(onDelete).toHaveBeenCalledWith('wl-1')
  })
})
