import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthlyBreakdown } from './MonthlyBreakdown'
import type { MonthPlan } from '@/lib/optimizer/types'

describe('MonthlyBreakdown', () => {
  const mockMonths: MonthPlan[] = [
    {
      month: '2026-01',
      actions: [
        {
          service_id: 'svc-1',
          service_name: 'Netflix',
          action: 'keep',
          date: '2026-01-01',
          reason: 'Stranger Things releasing',
        },
      ],
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
          reason: 'No matching content',
        },
      ],
      active_services: [],
      monthly_cost: 0,
    },
  ]

  it('renders month headers', () => {
    render(<MonthlyBreakdown months={mockMonths} />)

    expect(screen.getByText('January 2026')).toBeInTheDocument()
    expect(screen.getByText('February 2026')).toBeInTheDocument()
  })

  it('shows monthly cost in header', () => {
    render(<MonthlyBreakdown months={mockMonths} />)

    expect(screen.getByText(/\$15\.99/)).toBeInTheDocument()
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument()
  })

  it('expands to show actions when clicked', () => {
    render(<MonthlyBreakdown months={mockMonths} />)

    // Initially actions might be hidden
    const januaryHeader = screen.getByText('January 2026').closest('button')
    fireEvent.click(januaryHeader!)

    // After clicking, should show action details
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/Stranger Things releasing/)).toBeInTheDocument()
  })

  it('shows action type badge', () => {
    render(<MonthlyBreakdown months={mockMonths} />)

    const januaryHeader = screen.getByText('January 2026').closest('button')
    fireEvent.click(januaryHeader!)

    expect(screen.getByText('keep')).toBeInTheDocument()
  })

  it('handles empty months array', () => {
    render(<MonthlyBreakdown months={[]} />)

    expect(screen.getByText(/No months/i)).toBeInTheDocument()
  })

  it('shows active services count', () => {
    render(<MonthlyBreakdown months={mockMonths} />)

    // January has 1 active service
    expect(screen.getByText(/1 service/i)).toBeInTheDocument()
    // February has 0 active services
    expect(screen.getByText(/0 services/i)).toBeInTheDocument()
  })
})
