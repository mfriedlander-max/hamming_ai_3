'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberCard } from './MemberCard'
import type { HouseholdMemberWithProfile } from '@/lib/household/types'

interface MembersListProps {
  members: HouseholdMemberWithProfile[]
  currentUserId: string
  isOwner: boolean
  onRemoveMember: (userId: string) => void
  onInvite: () => void
}

export function MembersList({
  members,
  currentUserId,
  isOwner,
  onRemoveMember,
  onInvite,
}: MembersListProps) {
  const memberCount = members.length
  const memberLabel = memberCount === 1 ? 'member' : 'members'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {memberCount} {memberLabel}
        </h3>
        <Button variant="outline" size="sm" onClick={onInvite}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId
          const isMemberOwner = member.role === 'owner'

          // Owner can remove anyone except themselves
          // Non-owner can only leave (remove themselves)
          let canRemove = false
          if (isOwner && !isCurrentUser) {
            canRemove = true
          } else if (!isOwner && isCurrentUser && !isMemberOwner) {
            canRemove = true
          }

          return (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={isCurrentUser}
              canRemove={canRemove}
              onRemove={onRemoveMember}
            />
          )
        })}
      </div>
    </div>
  )
}
