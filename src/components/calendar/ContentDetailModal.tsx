'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X, PlayCircle } from 'lucide-react'
import type { ContentRelease } from '@/lib/calendar/types'

export interface ContentDetailModalProps {
  release: ContentRelease
  serviceId: string
  onClose: () => void
  onSetReminder: (release: ContentRelease) => void
  onPlanBinge?: (release: ContentRelease, serviceId: string) => void
}

export function ContentDetailModal({
  release,
  serviceId,
  onClose,
  onSetReminder,
  onPlanBinge,
}: ContentDetailModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const typeLabel = release.type === 'movie' ? 'Movie' : 'TV Show'
  const typeBadgeColor = release.type === 'movie' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{release.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Releases {formatDate(release.release_date)}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content type badge */}
          <div className="flex items-center gap-2">
            <Badge className={typeBadgeColor}>
              {typeLabel}
            </Badge>
          </div>

          {/* Genres */}
          {release.genres.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {release.genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Poster placeholder */}
          {release.poster_url && (
            <div className="relative aspect-[2/3] w-32 bg-gray-200 rounded-lg overflow-hidden">
              {/* Image would go here */}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {release.type === 'tv' && onPlanBinge && (
            <Button variant="outline" onClick={() => onPlanBinge(release, serviceId)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Plan Binge
            </Button>
          )}
          <Button onClick={() => onSetReminder(release)}>
            <Bell className="h-4 w-4 mr-2" />
            Set Reminder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
