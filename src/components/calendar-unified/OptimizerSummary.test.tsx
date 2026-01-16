import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OptimizerSummary } from './OptimizerSummary'
import type { CalendarSavings, CalendarAction } from '@/lib/optimizer-v2/types'

type Savings = CalendarSavings
type ThisWeekAction = CalendarAction

const mockSavings: Savings = {
  current_annual_cost: 1200,
  optimized_annual_cost: 600,
  annual_savings: 600,
  savings_percentage: 50,
}

const mockActions: ThisWeekAction[] = [
  {
    id: 'action-1',
    action_type: 'pause',
    service_id: 'service-1',
    service_name: 'Netflix',
    scheduled_date: '2026-01-20',
    reason: 'No upcoming content in your queue',
  },
  {
    id: 'action-2',
    action_type: 'subscribe',
    service_id: 'service-2',
    service_name: 'Disney+',
    scheduled_date: '2026-01-22',
    reason: 'New Marvel show releasing',
  },
]

describe('OptimizerSummary', () => {
  it('renders savings amount prominently', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={[]}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    // Savings should be displayed prominently (text-6xl)
    expect(screen.getByText('$600')).toBeInTheDocument()
    expect(screen.getByText(/annual savings/i)).toBeInTheDocument()
  })

  it('displays savings percentage', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={[]}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows progress bar for savings', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={[]}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
  })

  it('displays this week actions list', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={mockActions}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/this week/i)).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Disney+')).toBeInTheDocument()
    expect(screen.getByText(/pause/i)).toBeInTheDocument()
    expect(screen.getByText(/subscribe/i)).toBeInTheDocument()
  })

  it('calls onApplyAll when Apply All button is clicked', () => {
    const onApplyAll = vi.fn()
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={mockActions}
        onApplyAll={onApplyAll}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /apply all/i }))
    expect(onApplyAll).toHaveBeenCalled()
  })

  it('calls onRegenerate when Regenerate button is clicked', () => {
    const onRegenerate = vi.fn()
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={mockActions}
        onApplyAll={() => {}}
        onRegenerate={onRegenerate}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /regenerate/i }))
    expect(onRegenerate).toHaveBeenCalled()
  })

  it('disables buttons when loading', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={mockActions}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={true}
      />
    )

    expect(screen.getByRole('button', { name: /apply all/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeDisabled()
  })

  it('shows empty state when no actions', () => {
    render(
      <OptimizerSummary
        savings={mockSavings}
        actions={[]}
        onApplyAll={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />
    )

    expect(screen.getByText(/no actions needed this week/i)).toBeInTheDocument()
  })
})
