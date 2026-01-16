import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentCalendarPage } from './ContentCalendarPage'
import type { CalendarOptimizedPlan, ContentRelease } from '@/lib/optimizer-v2/types'

// Mock child components to isolate the orchestrator
vi.mock('./OptimizerSummary', () => ({
  OptimizerSummary: vi.fn(({ savings }) => (
    <div data-testid="optimizer-summary">
      Savings: ${savings.annual_savings}
    </div>
  )),
}))

vi.mock('./WatchQueue', () => ({
  WatchQueue: vi.fn(({ slots }) => (
    <div data-testid="watch-queue">
      Queue items: {slots.length}
    </div>
  )),
}))

vi.mock('./CalendarView', () => ({
  CalendarView: vi.fn(({ windows }) => (
    <div data-testid="calendar-view">
      Windows: {windows.length}
    </div>
  )),
}))

vi.mock('./UpcomingReleases', () => ({
  UpcomingReleases: vi.fn(({ releases }) => (
    <div data-testid="upcoming-releases">
      Releases: {releases.length}
    </div>
  )),
}))

vi.mock('./ReleaseDetailModal', () => ({
  ReleaseDetailModal: vi.fn(() => <div data-testid="release-modal" />),
}))

const mockPlan: CalendarOptimizedPlan = {
  savings: {
    current_annual_cost: 1200,
    optimized_annual_cost: 600,
    annual_savings: 600,
    savings_percentage: 50,
  },
  watch_queue: [
    {
      intent_id: 'intent-1',
      title: 'Stranger Things',
      service_id: 'service-1',
      service_name: 'Netflix',
      scheduled_date: '2026-01-20',
      duration_minutes: 90,
      priority_score: 85,
      source: 'watchlist' as const,
    },
  ],
  subscription_windows: [
    {
      service_id: 'service-1',
      service_name: 'Netflix',
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      monthly_cost: 15.99,
      is_currently_subscribed: true,
      reason: 'Stranger Things',
    },
  ],
  this_week_actions: [],
}

const mockReleases: ContentRelease[] = [
  {
    id: 'release-1',
    title: 'New Show',
    release_date: '2026-01-20',
    service_id: 'service-1',
    service_name: 'Netflix',
    type: 'series',
    taste_match_score: 85,
  },
]

describe('ContentCalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all four sections', () => {
    render(
      <ContentCalendarPage
        plan={mockPlan}
        releases={mockReleases}
        isLoading={false}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByTestId('optimizer-summary')).toBeInTheDocument()
    expect(screen.getByTestId('watch-queue')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    expect(screen.getByTestId('upcoming-releases')).toBeInTheDocument()
  })

  it('passes correct data to OptimizerSummary', () => {
    render(
      <ContentCalendarPage
        plan={mockPlan}
        releases={mockReleases}
        isLoading={false}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByText('Savings: $600')).toBeInTheDocument()
  })

  it('passes correct data to WatchQueue', () => {
    render(
      <ContentCalendarPage
        plan={mockPlan}
        releases={mockReleases}
        isLoading={false}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByText('Queue items: 1')).toBeInTheDocument()
  })

  it('passes correct data to CalendarView', () => {
    render(
      <ContentCalendarPage
        plan={mockPlan}
        releases={mockReleases}
        isLoading={false}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByText('Windows: 1')).toBeInTheDocument()
  })

  it('passes correct data to UpcomingReleases', () => {
    render(
      <ContentCalendarPage
        plan={mockPlan}
        releases={mockReleases}
        isLoading={false}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByText('Releases: 1')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(
      <ContentCalendarPage
        plan={null}
        releases={[]}
        isLoading={true}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        onRemoveFromQueue={() => {}}
        onAddToQueue={() => {}}
      />
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
