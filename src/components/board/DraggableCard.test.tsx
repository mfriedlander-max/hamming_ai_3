import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { DraggableCard } from './DraggableCard'
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

// Wrapper to provide DndContext for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>
}

describe('DraggableCard', () => {
  it('renders subscription service name', () => {
    render(
      <TestWrapper>
        <DraggableCard
          subscription={mockSubscription}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('renders subscription price', () => {
    render(
      <TestWrapper>
        <DraggableCard
          subscription={mockSubscription}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('$15.99')).toBeInTheDocument()
  })

  it('has correct data-testid', () => {
    render(
      <TestWrapper>
        <DraggableCard
          subscription={mockSubscription}
          onStatusChange={vi.fn()}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('draggable-card-1')).toBeInTheDocument()
  })

  it('calls onStatusChange when status button is clicked', () => {
    const onStatusChange = vi.fn()
    render(
      <TestWrapper>
        <DraggableCard
          subscription={mockSubscription}
          onStatusChange={onStatusChange}
          onSetReminder={vi.fn()}
        />
      </TestWrapper>
    )

    // Use getAllByRole and find the actual button element (not the draggable wrapper)
    const buttons = screen.getAllByRole('button', { name: /pause/i })
    // The actual button is the one with data-slot="button"
    const pauseButton = buttons.find(btn => btn.getAttribute('data-slot') === 'button')
    expect(pauseButton).toBeDefined()
    fireEvent.click(pauseButton!)
    expect(onStatusChange).toHaveBeenCalledWith('1', 'paused')
  })
})
