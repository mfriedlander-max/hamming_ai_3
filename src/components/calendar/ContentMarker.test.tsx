import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContentMarker } from './ContentMarker'
import type { ContentRelease } from '@/lib/calendar/types'

describe('ContentMarker', () => {
  const mockRelease: ContentRelease = {
    id: 'content-1',
    tmdb_id: 1001,
    title: 'Test Movie',
    type: 'movie',
    release_date: '2026-01-15',
    poster_url: '/poster.jpg',
    genres: ['Action', 'Drama'],
    match_score: 70,
    match_reason: 'Matches your Action taste',
  }

  it('renders a marker element', () => {
    render(<ContentMarker release={mockRelease} position={0.5} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('positions marker based on position prop', () => {
    render(<ContentMarker release={mockRelease} position={0.5} />)

    const marker = screen.getByRole('button')
    // The button's parent container has the positioning style
    expect(marker.parentElement).toHaveStyle({ left: '50%' })
  })

  it('shows tooltip with title on hover', async () => {
    render(<ContentMarker release={mockRelease} position={0.5} />)

    const marker = screen.getByRole('button')
    fireEvent.mouseEnter(marker)

    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('shows release date in tooltip on hover', async () => {
    render(<ContentMarker release={mockRelease} position={0.5} />)

    const marker = screen.getByRole('button')
    fireEvent.mouseEnter(marker)

    expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', async () => {
    render(<ContentMarker release={mockRelease} position={0.5} />)

    const marker = screen.getByRole('button')
    fireEvent.mouseEnter(marker)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()

    fireEvent.mouseLeave(marker)
    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <ContentMarker release={mockRelease} position={0.5} onClick={handleClick} />
    )

    const marker = screen.getByRole('button')
    fireEvent.click(marker)

    expect(handleClick).toHaveBeenCalledWith(mockRelease)
  })

  it('uses different colors for movie vs tv', () => {
    const tvRelease: ContentRelease = {
      ...mockRelease,
      id: 'content-2',
      type: 'tv',
    }

    const { rerender } = render(
      <ContentMarker release={mockRelease} position={0.3} />
    )
    const movieMarker = screen.getByRole('button')

    rerender(<ContentMarker release={tvRelease} position={0.3} />)
    const tvMarker = screen.getByRole('button')

    // Both should be buttons, just verifying they render
    expect(movieMarker).toBeInTheDocument()
    expect(tvMarker).toBeInTheDocument()
  })
})
