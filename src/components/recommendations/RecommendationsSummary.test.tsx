import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecommendationsSummary } from './RecommendationsSummary'
import type { Recommendation } from '@/lib/types/content'

describe('RecommendationsSummary', () => {
  const mockRecommendations: Recommendation[] = [
    {
      service_id: 'netflix',
      verdict: 'keep',
      top_matches: ['Show 1'],
      reason: 'Keep it',
    },
    {
      service_id: 'hulu',
      verdict: 'pause',
      top_matches: [],
      reason: 'Pause it',
    },
    {
      service_id: 'disney',
      verdict: 'pause',
      top_matches: [],
      reason: 'Pause this too',
    },
    {
      service_id: 'hbo',
      verdict: 'consider',
      top_matches: [],
      reason: 'Consider it',
    },
  ]

  const mockServices = [
    { id: 'netflix', name: 'Netflix', monthly_cost: 15.99 },
    { id: 'hulu', name: 'Hulu', monthly_cost: 9.99 },
    { id: 'disney', name: 'Disney+', monthly_cost: 12.99 },
    { id: 'hbo', name: 'HBO Max', monthly_cost: 14.99 },
  ]

  it('displays potential savings from pause recommendations', () => {
    render(
      <RecommendationsSummary
        recommendations={mockRecommendations}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    // Hulu ($9.99) + Disney ($12.99) = $22.98
    expect(screen.getByText(/save.*\$22\.98/i)).toBeInTheDocument()
  })

  it('displays count of services to pause', () => {
    render(
      <RecommendationsSummary
        recommendations={mockRecommendations}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/2 services/i)).toBeInTheDocument()
  })

  it('shows refresh button', () => {
    render(
      <RecommendationsSummary
        recommendations={mockRecommendations}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn()

    render(
      <RecommendationsSummary
        recommendations={mockRecommendations}
        services={mockServices}
        onRefresh={onRefresh}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('disables refresh button while loading', () => {
    render(
      <RecommendationsSummary
        recommendations={mockRecommendations}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={true}
      />
    )

    expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled()
  })

  it('shows no savings message when all services are keep', () => {
    const keepOnlyRecs: Recommendation[] = [
      {
        service_id: 'netflix',
        verdict: 'keep',
        top_matches: [],
        reason: 'Keep it',
      },
    ]

    render(
      <RecommendationsSummary
        recommendations={keepOnlyRecs}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/no savings/i)).toBeInTheDocument()
  })

  it('handles empty recommendations gracefully', () => {
    render(
      <RecommendationsSummary
        recommendations={[]}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/no recommendations/i)).toBeInTheDocument()
  })

  it('displays singular form for 1 service', () => {
    const singlePauseRec: Recommendation[] = [
      {
        service_id: 'hulu',
        verdict: 'pause',
        top_matches: [],
        reason: 'Pause it',
      },
    ]

    render(
      <RecommendationsSummary
        recommendations={singlePauseRec}
        services={mockServices}
        onRefresh={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/1 service\b/i)).toBeInTheDocument()
  })
})
