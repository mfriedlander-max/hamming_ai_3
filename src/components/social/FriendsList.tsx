'use client'

import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FriendCard } from './FriendCard'
import { FriendRequestCard } from './FriendRequestCard'
import type { Friend, FriendRequest } from '@/lib/social/types'

interface FriendsListProps {
  friends: Friend[]
  pendingRequests: FriendRequest[]
  onRemove: (friendshipId: string) => void
  onAccept: (friendshipId: string) => void
  onDecline: (friendshipId: string) => void
  onAddFriend: () => void
  isLoading?: boolean
  processingIds?: string[]
}

function LoadingSkeleton() {
  return (
    <div data-testid="friends-loading" className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border animate-pulse"
        >
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FriendsList({
  friends,
  pendingRequests,
  onRemove,
  onAccept,
  onDecline,
  onAddFriend,
  isLoading = false,
  processingIds = [],
}: FriendsListProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Friend button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Friends</h2>
          <span className="text-sm text-muted-foreground">({friends.length})</span>
        </div>
        <Button onClick={onAddFriend} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Friend Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={onAccept}
                onDecline={onDecline}
                isProcessing={processingIds.includes(request.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Friends Grid */}
      {friends.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No friends yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add friends to see their subscription activity
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onRemove={onRemove}
              isRemoving={processingIds.includes(friend.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
