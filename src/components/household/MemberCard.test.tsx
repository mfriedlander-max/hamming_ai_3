import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemberCard } from './MemberCard'
import type { HouseholdMemberWithProfile } from '@/lib/household/types'

const mockMember: HouseholdMemberWithProfile = {
  id: 'member-1',
  household_id: 'household-1',
  user_id: 'user-123',
  role: 'member',
  display_name: 'John',
  joined_at: '2026-01-01T00:00:00Z',
  profile: { id: 'user-123', name: 'John Smith' },
}

const mockOwner: HouseholdMemberWithProfile = {
  id: 'member-2',
  household_id: 'household-1',
  user_id: 'user-456',
  role: 'owner',
  display_name: null,
  joined_at: '2026-01-01T00:00:00Z',
  profile: { id: 'user-456', name: 'Jane Smith' },
}

describe('MemberCard', () => {
  it('renders member display name', () => {
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={false} />)

    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('falls back to profile name when display_name is null', () => {
    render(<MemberCard member={mockOwner} isCurrentUser={false} canRemove={false} />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows owner badge for owners', () => {
    render(<MemberCard member={mockOwner} isCurrentUser={false} canRemove={false} />)

    expect(screen.getByText('Owner')).toBeInTheDocument()
  })

  it('does not show owner badge for regular members', () => {
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={false} />)

    expect(screen.queryByText('Owner')).not.toBeInTheDocument()
  })

  it('shows "You" indicator for current user', () => {
    render(<MemberCard member={mockMember} isCurrentUser={true} canRemove={false} />)

    expect(screen.getByText(/you/i)).toBeInTheDocument()
  })

  it('shows remove button when canRemove is true', () => {
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={true} onRemove={vi.fn()} />)

    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('hides remove button when canRemove is false', () => {
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={false} />)

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={true} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalledWith('user-123')
  })

  it('renders avatar with first letter of name', () => {
    render(<MemberCard member={mockMember} isCurrentUser={false} canRemove={false} />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('shows leave button text for current user', () => {
    render(<MemberCard member={mockMember} isCurrentUser={true} canRemove={true} onRemove={vi.fn()} />)

    expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument()
  })
})
