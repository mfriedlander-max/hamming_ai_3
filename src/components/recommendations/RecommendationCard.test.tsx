import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecommendationCard } from './RecommendationCard'
import type { Recommendation } from '@/lib/types/content'

describe('RecommendationCard', () => {
  const mockRecommendation: Recommendation = {
    service_id: 'netflix',
    verdict: 'keep',
    top_matches: ['Stranger Things S5', 'Wednesday S2', 'The Witcher S4'],
    reason: 'Multiple highly-anticipated releases match your sci-fi preferences',
  }

  const mockService = {
    id: 'netflix',
    name: 'Netflix',
    monthly_cost: 15.99,
  }

  it('displays service name', () => {
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('displays recommendation badge with correct verdict', () => {
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('displays top matches list', () => {
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByText('Stranger Things S5')).toBeInTheDocument()
    expect(screen.getByText('Wednesday S2')).toBeInTheDocument()
    expect(screen.getByText('The Witcher S4')).toBeInTheDocument()
  })

  it('displays reason text', () => {
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(
      screen.getByText('Multiple highly-anticipated releases match your sci-fi preferences')
    ).toBeInTheDocument()
  })

  it('shows Quick Pause button for pause verdict', () => {
    const pauseRecommendation: Recommendation = {
      ...mockRecommendation,
      verdict: 'pause',
      resume_date: '2024-07-01',
    }

    render(
      <RecommendationCard
        recommendation={pauseRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('calls onPause when Quick Pause button is clicked', () => {
    const onPause = vi.fn()
    const pauseRecommendation: Recommendation = {
      ...mockRecommendation,
      verdict: 'pause',
      resume_date: '2024-07-01',
    }

    render(
      <RecommendationCard
        recommendation={pauseRecommendation}
        service={mockService}
        onPause={onPause}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(onPause).toHaveBeenCalledWith('netflix', '2024-07-01')
  })

  it('displays resume date for pause recommendations', () => {
    const pauseRecommendation: Recommendation = {
      ...mockRecommendation,
      verdict: 'pause',
      resume_date: '2024-07-01',
    }

    render(
      <RecommendationCard
        recommendation={pauseRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByText(/resume.*july/i)).toBeInTheDocument()
  })

  it('does not show pause button for keep verdict', () => {
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
  })

  it('handles empty top_matches gracefully', () => {
    const emptyMatchesRec: Recommendation = {
      ...mockRecommendation,
      top_matches: [],
    }

    render(
      <RecommendationCard
        recommendation={emptyMatchesRec}
        service={mockService}
        onPause={() => {}}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.queryByText('Top Matches:')).not.toBeInTheDocument()
  })
})
