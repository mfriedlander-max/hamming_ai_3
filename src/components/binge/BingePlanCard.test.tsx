import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BingePlanCard } from './BingePlanCard'
import type { BingePlan } from '@/lib/binge/types'

const mockPlan: BingePlan = {
  show_id: 12345,
  show_title: 'Test Show',
  service_id: 'service-123',
  service_name: 'Netflix',
  total_episodes: 10,
  total_hours: 8,
  days_to_complete: 5,
  subscribe_date: '2026-01-31',
  cancel_date: '2026-02-08',
  estimated_cost: 15.99,
  watch_speed: 2,
  poster_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
}

describe('BingePlanCard', () => {
  it('renders show title and poster', () => {
    render(<BingePlanCard plan={mockPlan} onSetReminders={vi.fn()} />)

    expect(screen.getByText('Test Show')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders episode count and total hours', () => {
    render(<BingePlanCard plan={mockPlan} onSetReminders={vi.fn()} />)

    expect(screen.getByText(/10 episodes/)).toBeInTheDocument()
    expect(screen.getByText(/8 hours/)).toBeInTheDocument()
  })

  it('renders subscribe and cancel dates', () => {
    render(<BingePlanCard plan={mockPlan} onSetReminders={vi.fn()} />)

    expect(screen.getByText(/Jan 31/)).toBeInTheDocument()
    expect(screen.getByText(/Feb 8/)).toBeInTheDocument()
  })

  it('renders estimated cost', () => {
    render(<BingePlanCard plan={mockPlan} onSetReminders={vi.fn()} />)

    expect(screen.getByText('$15.99')).toBeInTheDocument()
  })

  it('renders Set Reminders button', () => {
    render(<BingePlanCard plan={mockPlan} onSetReminders={vi.fn()} />)

    expect(screen.getByRole('button', { name: /set reminders/i })).toBeInTheDocument()
  })

  it('calls onSetReminders when button is clicked', () => {
    const handleSetReminders = vi.fn()
    render(<BingePlanCard plan={mockPlan} onSetReminders={handleSetReminders} />)

    fireEvent.click(screen.getByRole('button', { name: /set reminders/i }))

    expect(handleSetReminders).toHaveBeenCalledWith(mockPlan)
  })

  it('handles null poster_url', () => {
    const planWithoutPoster = { ...mockPlan, poster_url: null }
    render(<BingePlanCard plan={planWithoutPoster} onSetReminders={vi.fn()} />)

    // Should show placeholder or fallback
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('poster-placeholder')).toBeInTheDocument()
  })
})
