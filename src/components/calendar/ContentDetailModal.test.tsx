import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContentDetailModal } from './ContentDetailModal'
import type { ContentRelease } from '@/lib/calendar/types'

describe('ContentDetailModal', () => {
  const mockRelease: ContentRelease = {
    id: 'content-1',
    tmdb_id: 1001,
    title: 'Test Movie',
    type: 'movie',
    release_date: '2026-01-15',
    poster_url: '/poster.jpg',
    genres: ['Action', 'Drama', 'Sci-Fi'],
    match_score: 75,
    match_reason: 'Matches your Action, Drama taste',
  }

  const defaultProps = {
    release: mockRelease,
    serviceId: 'service-123',
    onClose: vi.fn(),
    onSetReminder: vi.fn(),
  }

  it('renders content title', () => {
    render(<ContentDetailModal {...defaultProps} />)

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('renders release date', () => {
    render(<ContentDetailModal {...defaultProps} />)

    expect(screen.getByText(/January 15, 2026/)).toBeInTheDocument()
  })

  it('renders content type badge', () => {
    render(<ContentDetailModal {...defaultProps} />)

    expect(screen.getByText('Movie')).toBeInTheDocument()
  })

  it('renders genre badges', () => {
    render(<ContentDetailModal {...defaultProps} />)

    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(<ContentDetailModal {...defaultProps} onClose={handleClose} />)

    // Get all close buttons and click the first one (our custom close button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    fireEvent.click(closeButtons[0])

    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onSetReminder when Set Reminder button is clicked', () => {
    const handleSetReminder = vi.fn()
    render(
      <ContentDetailModal {...defaultProps} onSetReminder={handleSetReminder} />
    )

    const reminderButton = screen.getByRole('button', { name: /set reminder/i })
    fireEvent.click(reminderButton)

    expect(handleSetReminder).toHaveBeenCalledWith(mockRelease)
  })

  it('renders TV type correctly', () => {
    const tvRelease: ContentRelease = {
      ...mockRelease,
      type: 'tv',
      title: 'Test Show',
    }

    render(<ContentDetailModal {...defaultProps} release={tvRelease} />)

    expect(screen.getByText('TV Show')).toBeInTheDocument()
  })

  it('shows Plan Binge button for TV shows when handler is provided', () => {
    const tvRelease: ContentRelease = {
      ...mockRelease,
      type: 'tv',
      title: 'Test Show',
    }
    const handlePlanBinge = vi.fn()

    render(
      <ContentDetailModal
        {...defaultProps}
        release={tvRelease}
        onPlanBinge={handlePlanBinge}
      />
    )

    expect(screen.getByRole('button', { name: /plan binge/i })).toBeInTheDocument()
  })

  it('does not show Plan Binge button for movies', () => {
    const handlePlanBinge = vi.fn()

    render(
      <ContentDetailModal
        {...defaultProps}
        release={mockRelease}
        onPlanBinge={handlePlanBinge}
      />
    )

    expect(screen.queryByRole('button', { name: /plan binge/i })).not.toBeInTheDocument()
  })

  it('calls onPlanBinge with release and serviceId when clicked', () => {
    const tvRelease: ContentRelease = {
      ...mockRelease,
      type: 'tv',
      title: 'Test Show',
    }
    const handlePlanBinge = vi.fn()

    render(
      <ContentDetailModal
        {...defaultProps}
        release={tvRelease}
        onPlanBinge={handlePlanBinge}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /plan binge/i }))

    expect(handlePlanBinge).toHaveBeenCalledWith(tvRelease, 'service-123')
  })
})
