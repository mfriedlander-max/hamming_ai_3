import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceLane } from './ServiceLane'
import type { ContentRelease } from '@/lib/calendar/types'

describe('ServiceLane', () => {
  const mockReleases: ContentRelease[] = [
    {
      id: 'content-1',
      tmdb_id: 1001,
      title: 'Movie A',
      type: 'movie',
      release_date: '2026-01-10',
      poster_url: '/poster1.jpg',
      genres: ['Action'],
    },
    {
      id: 'content-2',
      tmdb_id: 1002,
      title: 'Show B',
      type: 'tv',
      release_date: '2026-01-25',
      poster_url: '/poster2.jpg',
      genres: ['Drama'],
    },
  ]

  const defaultProps = {
    serviceId: 'service-123',
    serviceName: 'Netflix',
    subscriptionId: 'sub-456',
    releases: mockReleases,
    monthStart: '2026-01',
    onSelectRelease: vi.fn(),
  }

  it('renders service name', () => {
    render(<ServiceLane {...defaultProps} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('renders timeline bar', () => {
    render(<ServiceLane {...defaultProps} />)

    expect(screen.getByTestId('timeline-bar')).toBeInTheDocument()
  })

  it('renders content markers for each release', () => {
    render(<ServiceLane {...defaultProps} />)

    // Should render 2 markers (buttons)
    const markers = screen.getAllByRole('button')
    expect(markers).toHaveLength(2)
  })

  it('positions markers correctly based on release date', () => {
    render(<ServiceLane {...defaultProps} />)

    const markers = screen.getAllByRole('button')

    // First movie on Jan 10 should be positioned earlier than show on Jan 25
    const marker1Parent = markers[0].parentElement
    const marker2Parent = markers[1].parentElement

    // Get left positions
    const left1 = marker1Parent?.style.left || '0%'
    const left2 = marker2Parent?.style.left || '0%'

    // First should be less than second (earlier in month)
    expect(parseFloat(left1)).toBeLessThan(parseFloat(left2))
  })

  it('calls onSelectRelease with release, serviceId, and subscriptionId when a marker is clicked', () => {
    const handleSelect = vi.fn()
    render(<ServiceLane {...defaultProps} onSelectRelease={handleSelect} />)

    const markers = screen.getAllByRole('button')
    fireEvent.click(markers[0])

    expect(handleSelect).toHaveBeenCalledWith(mockReleases[0], 'service-123', 'sub-456')
  })

  it('renders empty lane when no releases', () => {
    render(<ServiceLane {...defaultProps} releases={[]} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-bar')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows release count indicator', () => {
    render(<ServiceLane {...defaultProps} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
