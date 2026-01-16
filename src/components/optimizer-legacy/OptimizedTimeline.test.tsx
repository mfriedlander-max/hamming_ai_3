import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OptimizedTimeline } from './OptimizedTimeline'
import type { MonthPlan } from '@/lib/optimizer-legacy/types'

describe('OptimizedTimeline', () => {
  const mockMonths: MonthPlan[] = [
    {
      month: '2026-01',
      actions: [],
      active_services: ['svc-1'],
      monthly_cost: 15.99,
    },
    {
      month: '2026-02',
      actions: [
        {
          service_id: 'svc-1',
          service_name: 'Netflix',
          action: 'cancel',
          date: '2026-02-15',
          reason: 'No content',
        },
      ],
      active_services: [],
      monthly_cost: 0,
    },
    {
      month: '2026-03',
      actions: [
        {
          service_id: 'svc-1',
          service_name: 'Netflix',
          action: 'subscribe',
          date: '2026-03-01',
          reason: 'New content',
        },
      ],
      active_services: ['svc-1'],
      monthly_cost: 15.99,
    },
  ]

  it('renders all month columns', () => {
    render(<OptimizedTimeline months={mockMonths} />)

    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Feb')).toBeInTheDocument()
    expect(screen.getByText('Mar')).toBeInTheDocument()
  })

  it('shows active services indicator', () => {
    render(<OptimizedTimeline months={mockMonths} />)

    // January and March have active services, February does not
    const activeIndicators = screen.getAllByTestId('service-indicator')
    expect(activeIndicators.length).toBeGreaterThan(0)
  })

  it('displays cancel action icon', () => {
    render(<OptimizedTimeline months={mockMonths} />)

    // February has a cancel action
    expect(screen.getByTestId('action-cancel')).toBeInTheDocument()
  })

  it('displays subscribe action icon', () => {
    render(<OptimizedTimeline months={mockMonths} />)

    // March has a subscribe action
    expect(screen.getByTestId('action-subscribe')).toBeInTheDocument()
  })

  it('handles empty months array', () => {
    render(<OptimizedTimeline months={[]} />)

    expect(screen.getByText(/No schedule/i)).toBeInTheDocument()
  })

  it('shows monthly cost for each month', () => {
    render(<OptimizedTimeline months={mockMonths} />)

    // Should show costs - January $15.99, February $0, March $15.99
    expect(screen.getAllByText(/\$15\.99/)).toHaveLength(2)
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument()
  })
})
