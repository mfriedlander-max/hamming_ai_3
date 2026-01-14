import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HouseholdInsights } from './HouseholdInsights'
import type { AggregatedTaste, HouseholdMemberWithProfile } from '@/lib/household/types'

const mockAggregatedTaste: AggregatedTaste = {
  genres: ['Action', 'Comedy', 'Drama'],
  favorite_shows: ['Breaking Bad', 'The Office', 'Stranger Things'],
  member_count: 3,
}

const mockMembers: HouseholdMemberWithProfile[] = [
  {
    id: 'member-1',
    household_id: 'household-1',
    user_id: 'user-123',
    role: 'owner',
    display_name: 'John',
    joined_at: '2026-01-01T00:00:00Z',
    profile: { id: 'user-123', name: 'John Smith' },
  },
  {
    id: 'member-2',
    household_id: 'household-1',
    user_id: 'user-456',
    role: 'member',
    display_name: 'Jane',
    joined_at: '2026-01-02T00:00:00Z',
    profile: { id: 'user-456', name: 'Jane Smith' },
  },
]

describe('HouseholdInsights', () => {
  it('renders household name', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('Smith Family')).toBeInTheDocument()
  })

  it('displays monthly spend', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('$75.97')).toBeInTheDocument()
  })

  it('displays genres from aggregated taste', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Comedy')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('displays favorite shows from aggregated taste', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
    expect(screen.getByText('The Office')).toBeInTheDocument()
    expect(screen.getByText('Stranger Things')).toBeInTheDocument()
  })

  it('renders member avatars', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    // Should show avatars with first letter of display names
    const avatars = screen.getAllByTestId('member-avatar')
    expect(avatars.length).toBeGreaterThanOrEqual(1)
  })

  it('shows combined genres count', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText(/3 genres/i)).toBeInTheDocument()
  })

  it('shows combined shows count', () => {
    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={mockAggregatedTaste}
        members={mockMembers}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText(/3 shows/i)).toBeInTheDocument()
  })

  it('handles empty genres gracefully', () => {
    const emptyTaste: AggregatedTaste = {
      genres: [],
      favorite_shows: ['Breaking Bad'],
      member_count: 1,
    }

    render(
      <HouseholdInsights
        householdName="Smith Family"
        aggregatedTaste={emptyTaste}
        members={mockMembers}
        monthlySpend={0}
      />
    )

    expect(screen.getByText(/no genres/i)).toBeInTheDocument()
  })
})
