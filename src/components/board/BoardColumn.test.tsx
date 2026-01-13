import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { BoardColumn } from './BoardColumn'
import type { SubscriptionWithService } from '@/components/subscriptions/types'

const mockSubscription: SubscriptionWithService = {
  id: '1',
  user_id: 'user-1',
  service_id: 'service-1',
  status: 'active',
  monthly_cost: 15.99,
  created_at: '2024-01-01T00:00:00Z',
  board_column: 'active',
  service: {
    id: 'service-1',
    name: 'Netflix',
    slug: 'netflix',
    logo_url: '/logos/netflix.png',
    default_price: 15.99,
    tmdb_provider_id: 8,
    cancel_url: 'https://netflix.com/cancel',
  },
}

const mockSubscription2: SubscriptionWithService = {
  id: '2',
  user_id: 'user-1',
  service_id: 'service-2',
  status: 'active',
  monthly_cost: 9.99,
  created_at: '2024-01-01T00:00:00Z',
  board_column: 'active',
  service: {
    id: 'service-2',
    name: 'Disney+',
    slug: 'disney-plus',
    logo_url: '/logos/disney-plus.png',
    default_price: 9.99,
    tmdb_provider_id: 337,
    cancel_url: 'https://disneyplus.com/cancel',
  },
}

// Wrapper to provide DndContext for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>
}

describe('BoardColumn', () => {
  it('renders column title', () => {
    render(
      <TestWrapper>
        <BoardColumn
          id="active"
          title="Active"
          subscriptions={[]}
          totalCost={0}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays total cost in header', () => {
    render(
      <TestWrapper>
        <BoardColumn
          id="active"
          title="Active"
          subscriptions={[mockSubscription, mockSubscription2]}
          totalCost={25.98}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('$25.98/mo')).toBeInTheDocument()
  })

  it('displays $0.00/mo when empty', () => {
    render(
      <TestWrapper>
        <BoardColumn
          id="paused"
          title="Paused"
          subscriptions={[]}
          totalCost={0}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('$0.00/mo')).toBeInTheDocument()
  })

  it('renders subscription count badge', () => {
    render(
      <TestWrapper>
        <BoardColumn
          id="active"
          title="Active"
          subscriptions={[mockSubscription, mockSubscription2]}
          totalCost={25.98}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('has droppable area with correct data-testid', () => {
    render(
      <TestWrapper>
        <BoardColumn
          id="active"
          title="Active"
          subscriptions={[]}
          totalCost={0}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('board-column-active')).toBeInTheDocument()
  })
})
