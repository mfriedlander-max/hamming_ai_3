import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarView } from './CalendarView'
import type { CalendarSubscriptionWindow } from '@/lib/optimizer-v2/types'

type SubscriptionWindow = CalendarSubscriptionWindow

const mockWindows: SubscriptionWindow[] = [
  {
    service_id: 'service-1',
    service_name: 'Netflix',
    start_date: '2026-01-01',
    end_date: '2026-01-31',
    monthly_cost: 15.99,
    is_currently_subscribed: true,
    reason: 'Stranger Things Season 5',
  },
  {
    service_id: 'service-2',
    service_name: 'Disney+',
    start_date: '2026-01-15',
    end_date: '2026-02-15',
    monthly_cost: 10.99,
    is_currently_subscribed: false,
    reason: 'The Mandalorian Season 4',
  },
]

const mockReleases = [
  {
    id: 'release-1',
    title: 'Stranger Things S5',
    release_date: '2026-01-20',
    service_id: 'service-1',
    service_name: 'Netflix',
    type: 'series' as const,
    taste_match_score: 85,
  },
  {
    id: 'release-2',
    title: 'New Marvel Movie',
    release_date: '2026-01-25',
    service_id: 'service-2',
    service_name: 'Disney+',
    type: 'movie' as const,
    taste_match_score: 70,
  },
]

describe('CalendarView', () => {
  it('renders month navigation with current month', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    expect(screen.getByText(/january 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('displays subscription windows as bars', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    // Should show service names in lanes
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Disney+')).toBeInTheDocument()
  })

  it('shows release markers on the calendar', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    // Release titles should be visible or hoverable
    expect(screen.getByText('Stranger Things S5')).toBeInTheDocument()
    expect(screen.getByText('New Marvel Movie')).toBeInTheDocument()
  })

  it('calls onMonthChange when navigation buttons are clicked', () => {
    const onMonthChange = vi.fn()
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={onMonthChange}
        onSelectRelease={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(onMonthChange).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onMonthChange).toHaveBeenCalledTimes(2)
  })

  it('calls onSelectRelease when a release is clicked', () => {
    const onSelectRelease = vi.fn()
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={onSelectRelease}
      />
    )

    fireEvent.click(screen.getByText('Stranger Things S5'))
    expect(onSelectRelease).toHaveBeenCalledWith(mockReleases[0])
  })

  it('shows today button to return to current month', () => {
    const onMonthChange = vi.fn()
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={onMonthChange}
        onSelectRelease={() => {}}
      />
    )

    const todayButton = screen.getByRole('button', { name: /today/i })
    expect(todayButton).toBeInTheDocument()

    fireEvent.click(todayButton)
    expect(onMonthChange).toHaveBeenCalled()
  })

  it('differentiates current subscriptions from planned ones', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    // Netflix is currently subscribed, Disney+ is not
    // Should have different visual styling
    const netflixLane = screen.getByTestId('window-service-1')
    const disneyLane = screen.getByTestId('window-service-2')

    expect(netflixLane).toHaveClass('bg-green-500')
    expect(disneyLane).toHaveClass('bg-blue-500')
  })

  it('displays day labels in the calendar grid', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    // Should show day numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('shows empty state when no windows', () => {
    render(
      <CalendarView
        windows={[]}
        releases={[]}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    expect(screen.getByText(/no subscription windows/i)).toBeInTheDocument()
  })

  it('groups releases by service lane', () => {
    render(
      <CalendarView
        windows={mockWindows}
        releases={mockReleases}
        currentMonth={new Date('2026-01-15')}
        onMonthChange={() => {}}
        onSelectRelease={() => {}}
      />
    )

    // Each service should have its own lane with releases
    const netflixLane = screen.getByTestId('lane-service-1')
    const disneyLane = screen.getByTestId('lane-service-2')

    expect(netflixLane).toBeInTheDocument()
    expect(disneyLane).toBeInTheDocument()
  })
})
