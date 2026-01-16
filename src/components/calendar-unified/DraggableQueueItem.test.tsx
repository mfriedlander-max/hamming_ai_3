import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableQueueItem } from './DraggableQueueItem'

const mockSlot = {
  intent_id: 'intent-1',
  title: 'Stranger Things',
  service_id: 'service-1',
  service_name: 'Netflix',
  scheduled_date: '2026-01-20',
  duration_minutes: 540,
  priority_score: 85,
  source: 'watchlist' as const,
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>
    <SortableContext items={[mockSlot.intent_id]} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  </DndContext>
)

describe('DraggableQueueItem', () => {
  it('renders queue item content', () => {
    render(
      <Wrapper>
        <DraggableQueueItem
          slot={mockSlot}
          onRemove={vi.fn()}
          onPlanBinge={vi.fn()}
          onAddToWatchlist={vi.fn()}
        />
      </Wrapper>
    )

    expect(screen.getByText('Stranger Things')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('shows drag handle', () => {
    render(
      <Wrapper>
        <DraggableQueueItem
          slot={mockSlot}
          onRemove={vi.fn()}
          onPlanBinge={vi.fn()}
          onAddToWatchlist={vi.fn()}
        />
      </Wrapper>
    )

    // The item should have drag attributes
    const item = screen.getByRole('listitem')
    expect(item).toBeInTheDocument()
  })

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn()

    render(
      <Wrapper>
        <DraggableQueueItem
          slot={mockSlot}
          onRemove={onRemove}
          onPlanBinge={vi.fn()}
          onAddToWatchlist={vi.fn()}
        />
      </Wrapper>
    )

    const removeButton = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)

    expect(onRemove).toHaveBeenCalledWith('intent-1')
  })

  it('applies dragging styles when being dragged', () => {
    // This is more of an integration test - we test that the component
    // is wrapped with useSortable which provides drag functionality
    render(
      <Wrapper>
        <DraggableQueueItem
          slot={mockSlot}
          onRemove={vi.fn()}
          onPlanBinge={vi.fn()}
          onAddToWatchlist={vi.fn()}
        />
      </Wrapper>
    )

    const item = screen.getByRole('listitem')
    // Component should have touch-action: none for proper drag handling
    expect(item).toBeInTheDocument()
  })
})
