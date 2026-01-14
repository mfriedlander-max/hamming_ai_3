'use client'

import { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface InviteModalProps {
  inviteCode: string
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ inviteCode, isOpen, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Household</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share this code with family members to let them join your household.
          </p>

          <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
            <code className="flex-1 text-2xl font-mono font-bold text-center tracking-wider">
              {inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy invite code"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            This code can be used multiple times. Share it only with people you trust.
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
