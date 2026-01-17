'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Calendar, MessageSquare } from 'lucide-react'
import type { FriendInfo, WatchTogetherInput } from '@/lib/social-integration/types'

interface WatchTogetherModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: Omit<WatchTogetherInput, 'queue_item_id'>) => void
  friends: FriendInfo[]
  contentTitle: string
  queueItemId?: string
}

export function WatchTogetherModal({
  isOpen,
  onClose,
  onSubmit,
  friends,
  contentTitle,
}: WatchTogetherModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState('')
  const [message, setMessage] = useState('')

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSubmit = () => {
    if (selectedFriends.length === 0) return

    onSubmit({
      friend_ids: selectedFriends,
      scheduled_date: scheduledDate || undefined,
      message: message || undefined,
    })

    // Reset form
    setSelectedFriends([])
    setScheduledDate('')
    setMessage('')
  }

  const handleClose = () => {
    setSelectedFriends([])
    setScheduledDate('')
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Friends to Watch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Invite friends to watch <strong>{contentTitle}</strong> together
          </p>

          {/* Friend selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select friends</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {friends.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No friends to invite
                </p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`friend-${friend.id}`}
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => handleFriendToggle(friend.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={`friend-${friend.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {friend.name}
                      {friend.email && (
                        <span className="text-gray-400 ml-1 text-xs">
                          ({friend.email})
                        </span>
                      )}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Optional date picker */}
          <div className="space-y-2">
            <label htmlFor="scheduled-date" className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Scheduled date (optional)
            </label>
            <Input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Optional message */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Message (optional)
            </label>
            <Input
              id="message"
              type="text"
              placeholder="Let&apos;s watch this together!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedFriends.length === 0}
          >
            Send Invite{selectedFriends.length > 0 && ` (${selectedFriends.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
