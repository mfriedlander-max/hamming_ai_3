import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpcomingReleases } from './UpcomingReleases'

interface ContentRelease {
  id: string
  title: string
  release_date: string
  service_id: string
  service_name: string
  type: 'movie' | 'series'
  taste_match_score: number
  poster_path?: string
  friend_watching?: boolean
}

const mockReleases: ContentRelease[] = [
  {
    id: 'release-1',
    title: 'Stranger Things S5',
    release_date: '2026-01-20',
    service_id: 'service-1',
    service_name: 'Netflix',
    type: 'series',
    taste_match_score: 95,
    friend_watching: true,
  },
  {
    id: 'release-2',
    title: 'New Marvel Movie',
    release_date: '2026-01-25',
    service_id: 'service-2',
    service_name: 'Disney+',
    type: 'movie',
    taste_match_score: 70,
  },
  {
    id: 'release-3',
    title: 'The Last of Us S3',
    release_date: '2026-02-01',
    service_id: 'service-3',
    service_name: 'HBO Max',
    type: 'series',
    taste_match_score: 85,
  },
]

describe('UpcomingReleases', () => {
  it('renders list of upcoming releases', () => {
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    expect(screen.getByText('Stranger Things S5')).toBeInTheDocument()
    expect(screen.getByText('New Marvel Movie')).toBeInTheDocument()
    expect(screen.getByText('The Last of Us S3')).toBeInTheDocument()
  })

  it('displays taste match score for each release', () => {
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('shows service name and release date', () => {
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Disney+')).toBeInTheDocument()
    expect(screen.getByText('HBO Max')).toBeInTheDocument()
    // Dates displayed
    expect(screen.getAllByText(/jan|feb/i).length).toBeGreaterThanOrEqual(3)
  })

  it('displays friend activity indicator when friends are watching', () => {
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    // Only Stranger Things has friend_watching: true
    expect(screen.getByText(/friend/i)).toBeInTheDocument()
  })

  it('calls onAddToQueue when Add to Queue button is clicked', () => {
    const onAddToQueue = vi.fn()
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={onAddToQueue}
        onViewDetails={() => {}}
      />
    )

    const addButtons = screen.getAllByRole('button', { name: /add to queue/i })
    fireEvent.click(addButtons[0])

    expect(onAddToQueue).toHaveBeenCalledWith(mockReleases[0])
  })

  it('calls onViewDetails when release card is clicked', () => {
    const onViewDetails = vi.fn()
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={onViewDetails}
      />
    )

    fireEvent.click(screen.getByText('Stranger Things S5'))
    expect(onViewDetails).toHaveBeenCalledWith(mockReleases[0])
  })

  it('shows empty state when no releases', () => {
    render(
      <UpcomingReleases
        releases={[]}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    expect(screen.getByText(/no upcoming releases/i)).toBeInTheDocument()
  })

  it('shows type badge (movie/series) for each release', () => {
    render(
      <UpcomingReleases
        releases={mockReleases}
        onAddToQueue={() => {}}
        onViewDetails={() => {}}
      />
    )

    // Should show movie and series badges
    expect(screen.getByText('Movie')).toBeInTheDocument()
    expect(screen.getAllByText('Series').length).toBeGreaterThanOrEqual(2)
  })
})
