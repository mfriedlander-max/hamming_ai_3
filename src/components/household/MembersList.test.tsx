import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MembersList } from './MembersList'
import type { HouseholdMemberWithProfile } from '@/lib/household/types'

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

describe('MembersList', () => {
  it('renders all members', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('renders invite button', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
  })

  it('calls onInvite when invite button is clicked', () => {
    const onInvite = vi.fn()
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={onInvite}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /invite/i }))
    expect(onInvite).toHaveBeenCalled()
  })

  it('shows remove buttons for other members when user is owner', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    // Owner should see remove button for other member
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('does not show remove buttons when user is not owner', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-456"
        isOwner={false}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    // Non-owner can only leave themselves
    expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('calls onRemoveMember when remove is clicked', () => {
    const onRemoveMember = vi.fn()
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={onRemoveMember}
        onInvite={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemoveMember).toHaveBeenCalledWith('user-456')
  })

  it('shows member count in title', () => {
    render(
      <MembersList
        members={mockMembers}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    expect(screen.getByText(/2 members/i)).toBeInTheDocument()
  })

  it('shows singular "member" for single member', () => {
    render(
      <MembersList
        members={[mockMembers[0]]}
        currentUserId="user-123"
        isOwner={true}
        onRemoveMember={vi.fn()}
        onInvite={vi.fn()}
      />
    )

    expect(screen.getByText(/1 member/i)).toBeInTheDocument()
  })
})
