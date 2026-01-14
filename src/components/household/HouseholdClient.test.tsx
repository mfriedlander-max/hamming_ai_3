import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HouseholdClient } from './HouseholdClient'
import type { HouseholdWithMembers, TasteProfile } from '@/lib/household/types'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useRouter
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
  }),
}))

const mockHousehold: HouseholdWithMembers = {
  id: 'household-1',
  name: 'Smith Family',
  created_by: 'user-123',
  invite_code: 'ABCD1234',
  created_at: '2026-01-01T00:00:00Z',
  members: [
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
  ],
}

const mockTasteProfiles: TasteProfile[] = [
  {
    user_id: 'user-123',
    genres: ['Action', 'Comedy'],
    favorite_shows: ['Breaking Bad'],
  },
  {
    user_id: 'user-456',
    genres: ['Drama'],
    favorite_shows: ['The Office'],
  },
]

describe('HouseholdClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders household name', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    // The name appears in both header and insights
    expect(screen.getAllByText('Smith Family').length).toBeGreaterThanOrEqual(1)
  })

  it('renders all household members', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('shows invite modal when invite button is clicked', async () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /invite/i }))

    await waitFor(() => {
      expect(screen.getByText('ABCD1234')).toBeInTheDocument()
    })
  })

  it('shows delete button for owner', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('hides delete button for non-owner', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-456"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows combined genres from taste profiles', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Comedy')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
  })

  it('calls API to remove member when remove is clicked', async () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /remove/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/household/members?user_id=user-456',
        { method: 'DELETE' }
      )
    })
  })

  it('shows settings button for editing household', () => {
    render(
      <HouseholdClient
        household={mockHousehold}
        currentUserId="user-123"
        tasteProfiles={mockTasteProfiles}
        monthlySpend={75.97}
      />
    )

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })
})
