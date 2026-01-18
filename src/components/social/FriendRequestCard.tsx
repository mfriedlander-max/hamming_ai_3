'use client'

import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FriendRequest } from '@/lib/social/types'

interface FriendRequestCardProps {
  request: FriendRequest
  onAccept: (friendshipId: string) => void
  onDecline: (friendshipId: string) => void
  isProcessing?: boolean
}

function getInitial(name: string | null, email: string): string {
  if (name) {
    return name.charAt(0).toUpperCase()
  }
  return email.charAt(0).toUpperCase()
}

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
  isProcessing = false,
}: FriendRequestCardProps) {
  const displayName = request.requester_name || request.requester_email
  const initial = getInitial(request.requester_name, request.requester_email)

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-medium">
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground">Wants to be your friend</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(request.id)}
          disabled={isProcessing}
          className="text-muted-foreground hover:text-red-600 hover:border-red-300"
        >
          <X className="h-4 w-4 mr-1" />
          Decline
        </Button>
        <Button
          size="sm"
          onClick={() => onAccept(request.id)}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
      </div>
    </div>
  )
}
