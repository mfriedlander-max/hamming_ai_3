import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReleaseDetailModal } from './ReleaseDetailModal'

const mockRelease = {
  id: 'release-1',
  title: 'Stranger Things S5',
  release_date: '2026-01-20',
  service_id: 'service-1',
  service_name: 'Netflix',
  type: 'series' as const,
  taste_match_score: 95,
  overview: 'The final season of Stranger Things.',
  genres: ['Drama', 'Sci-Fi', 'Horror'],
  runtime: 60,
  season_count: 5,
}

describe('ReleaseDetailModal', () => {
  it('renders release details when open', () => {
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={true}
        onClose={() => {}}
        onAddToQueue={() => {}}
        onPlanBinge={() => {}}
        onSetReminder={() => {}}
      />
    )

    expect(screen.getByText('Stranger Things S5')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('The final season of Stranger Things.')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={false}
        onClose={() => {}}
        onAddToQueue={() => {}}
        onPlanBinge={() => {}}
        onSetReminder={() => {}}
      />
    )

    expect(screen.queryByText('Stranger Things S5')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={true}
        onClose={onClose}
        onAddToQueue={() => {}}
        onPlanBinge={() => {}}
        onSetReminder={() => {}}
      />
    )

    // There are two close buttons (dialog's built-in + custom), click first one
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    fireEvent.click(closeButtons[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onAddToQueue when Add to Queue button is clicked', () => {
    const onAddToQueue = vi.fn()
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={true}
        onClose={() => {}}
        onAddToQueue={onAddToQueue}
        onPlanBinge={() => {}}
        onSetReminder={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /add to queue/i }))
    expect(onAddToQueue).toHaveBeenCalledWith(mockRelease)
  })

  it('calls onPlanBinge when Plan Binge button is clicked for series', () => {
    const onPlanBinge = vi.fn()
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={true}
        onClose={() => {}}
        onAddToQueue={() => {}}
        onPlanBinge={onPlanBinge}
        onSetReminder={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /plan binge/i }))
    expect(onPlanBinge).toHaveBeenCalledWith(mockRelease)
  })

  it('calls onSetReminder when Set Reminder button is clicked', () => {
    const onSetReminder = vi.fn()
    render(
      <ReleaseDetailModal
        release={mockRelease}
        isOpen={true}
        onClose={() => {}}
        onAddToQueue={() => {}}
        onPlanBinge={() => {}}
        onSetReminder={onSetReminder}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /set reminder/i }))
    expect(onSetReminder).toHaveBeenCalledWith(mockRelease)
  })
})
