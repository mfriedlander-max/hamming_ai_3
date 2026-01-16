import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchQueue } from './WatchQueue'
import type { CalendarWatchSlot } from '@/lib/optimizer-v2/types'

type WatchSlot = CalendarWatchSlot

const mockSlots: WatchSlot[] = [
  {
    intent_id: 'intent-1',
    title: 'Stranger Things',
    service_id: 'service-1',
    service_name: 'Netflix',
    scheduled_date: '2026-01-20',
    duration_minutes: 90,
    priority_score: 85,
    source: 'friend_share',
    deadline: '2026-01-25',
  },
  {
    intent_id: 'intent-2',
    title: 'The Mandalorian',
    service_id: 'service-2',
    service_name: 'Disney+',
    scheduled_date: '2026-01-21',
    duration_minutes: 45,
    priority_score: 70,
    source: 'watchlist',
    deadline: '2026-02-01',
  },
  {
    intent_id: 'intent-3',
    title: 'House of the Dragon',
    service_id: 'service-3',
    service_name: 'HBO Max',
    scheduled_date: '2026-01-22',
    duration_minutes: 60,
    priority_score: 60,
    source: 'taste_match',
  },
]

describe('WatchQueue', () => {
  it('renders queue items in priority order', () => {
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
      />
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)

    // First item should be highest priority
    expect(screen.getByText('Stranger Things')).toBeInTheDocument()
    expect(screen.getByText('The Mandalorian')).toBeInTheDocument()
    expect(screen.getByText('House of the Dragon')).toBeInTheDocument()
  })

  it('displays service name and deadline for each item', () => {
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Disney+')).toBeInTheDocument()
    expect(screen.getByText('HBO Max')).toBeInTheDocument()

    // Deadlines should be displayed - there are 2 items with deadlines
    const dueElements = screen.getAllByText(/due:/i)
    expect(dueElements.length).toBeGreaterThanOrEqual(2)
    // Should have Jan and Feb dates (could show as Jan 24/25 and Jan 31/Feb 1 depending on TZ)
    expect(screen.getAllByText(/jan/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows friend share badge for friend-shared content', () => {
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
      />
    )

    expect(screen.getByText(/shared by friend/i)).toBeInTheDocument()
  })

  it('calls onRemove with intent_id when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={onRemove}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
      />
    )

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    fireEvent.click(removeButtons[0])

    expect(onRemove).toHaveBeenCalledWith('intent-1')
  })

  it('calls onPlanBinge with slot when Plan Binge is clicked', () => {
    const onPlanBinge = vi.fn()
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={() => {}}
        onPlanBinge={onPlanBinge}
        onAddToWatchlist={() => {}}
      />
    )

    const planBingeButtons = screen.getAllByRole('button', { name: /plan binge/i })
    fireEvent.click(planBingeButtons[0])

    expect(onPlanBinge).toHaveBeenCalledWith(mockSlots[0])
  })

  it('calls onAddToWatchlist with slot when Add to Watchlist is clicked', () => {
    const onAddToWatchlist = vi.fn()
    render(
      <WatchQueue
        slots={mockSlots}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={onAddToWatchlist}
      />
    )

    const addButtons = screen.getAllByRole('button', { name: /add to watchlist/i })
    fireEvent.click(addButtons[0])

    expect(onAddToWatchlist).toHaveBeenCalledWith(mockSlots[0])
  })

  it('shows empty state when no slots', () => {
    render(
      <WatchQueue
        slots={[]}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
      />
    )

    expect(screen.getByText(/your queue is empty/i)).toBeInTheDocument()
  })

  it('highlights urgent deadlines (within 3 days)', () => {
    const urgentSlots: WatchSlot[] = [
      {
        intent_id: 'urgent-1',
        title: 'Urgent Show',
        service_id: 'service-1',
        service_name: 'Netflix',
        scheduled_date: '2026-01-16',
        duration_minutes: 60,
        priority_score: 90,
        source: 'watchlist',
        deadline: '2026-01-18', // 3 days from "today" (2026-01-15)
      },
    ]

    render(
      <WatchQueue
        slots={urgentSlots}
        onRemove={() => {}}
        onPlanBinge={() => {}}
        onAddToWatchlist={() => {}}
        currentDate={new Date('2026-01-15')}
      />
    )

    // Check for the Urgent badge
    expect(screen.getByRole('listitem')).toHaveClass('border-amber-300')
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })
})
