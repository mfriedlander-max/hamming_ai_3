'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export interface CancelSubscriptionModalProps {
  open: boolean
  onClose: () => void
  subscription: {
    id: string
    service: {
      name: string
      cancel_url: string | null
    }
  } | null
  onConfirm: (subscriptionId: string, markAsPaused: boolean) => void
}

export function CancelSubscriptionModal({
  open,
  onClose,
  subscription,
  onConfirm,
}: CancelSubscriptionModalProps) {
  const [markAsPaused, setMarkAsPaused] = useState(true)

  // Don't render anything if subscription is null
  if (!subscription) {
    return null
  }

  const { id, service } = subscription
  const hasCancelUrl = service.cancel_url !== null

  const handleGoToCancel = () => {
    if (hasCancelUrl) {
      window.open(service.cancel_url!, '_blank', 'noopener,noreferrer')
    }

    if (markAsPaused) {
      onConfirm(id, true)
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {service.name}</DialogTitle>
          <DialogDescription>
            Manage your {service.name} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasCancelUrl ? (
            <>
              <p className="text-sm text-muted-foreground">
                This will open {service.name}&apos;s cancellation page in a new tab.
              </p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markAsPaused}
                  onChange={(e) => setMarkAsPaused(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Mark as paused in SubCycle after canceling
                </span>
              </label>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No cancellation link available for this service. Please visit the service&apos;s website directly to manage your subscription.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Subscription
          </Button>
          {hasCancelUrl && (
            <Button variant="destructive" onClick={handleGoToCancel}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Cancellation Page
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
