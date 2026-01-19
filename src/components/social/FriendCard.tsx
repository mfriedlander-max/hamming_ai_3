'use client'

import { X, Loader2 } from 'lucide-react'
import type { Friend } from '@/lib/social/types'

interface FriendCardProps {
  friend: Friend
  onRemove: (friendshipId: string) => void
  isRemoving?: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function getInitial(name: string | null | undefined): string {
  if (name) {
    return name.charAt(0).toUpperCase()
  }
  return '?'
}

export function FriendCard({ friend, onRemove, isRemoving = false }: FriendCardProps) {
  const displayName = friend.name || 'Unknown'
  const initial = getInitial(friend.name)

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-gray-300 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          Friends since {formatDate(friend.friends_since)}
        </p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(friend.id)}
        disabled={isRemoving}
        aria-label={isRemoving ? 'Removing friend' : 'Remove friend'}
        className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
