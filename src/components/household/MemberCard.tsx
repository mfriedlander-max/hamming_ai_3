'use client'

import { Crown, X, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { HouseholdMemberWithProfile } from '@/lib/household/types'

interface MemberCardProps {
  member: HouseholdMemberWithProfile
  isCurrentUser: boolean
  canRemove: boolean
  onRemove?: (userId: string) => void
}

export function MemberCard({ member, isCurrentUser, canRemove, onRemove }: MemberCardProps) {
  const displayName = member.display_name || member.profile?.name || 'Unknown'
  const initial = displayName.charAt(0).toUpperCase()
  const isOwner = member.role === 'owner'

  const handleRemove = () => {
    if (onRemove) {
      onRemove(member.user_id)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
        {initial}
      </div>

      {/* Name and badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">
            {displayName}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-gray-500">(You)</span>
          )}
        </div>
        {isOwner && (
          <Badge variant="secondary" className="mt-1 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        )}
      </div>

      {/* Remove/Leave button */}
      {canRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          aria-label={isCurrentUser ? 'Leave household' : 'Remove member'}
          className="text-gray-500 hover:text-red-600"
        >
          {isCurrentUser ? (
            <>
              <LogOut className="h-4 w-4 mr-1" />
              Leave
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-1" />
              Remove
            </>
          )}
        </Button>
      )}
    </div>
  )
}
