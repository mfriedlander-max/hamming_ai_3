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
import { X, Plus, Play, Bell, Film, Tv, Calendar } from 'lucide-react'

interface ContentRelease {
  id: string
  title: string
  release_date: string
  service_id: string
  service_name: string
  type: 'movie' | 'series'
  taste_match_score: number
  overview?: string
  genres?: string[]
  runtime?: number
  season_count?: number
  poster_path?: string
}

interface ReleaseDetailModalProps {
  release: ContentRelease | null
  isOpen: boolean
  onClose: () => void
  onAddToQueue: (release: ContentRelease) => void
  onPlanBinge: (release: ContentRelease) => void
  onSetReminder: (release: ContentRelease) => void
}

function formatReleaseDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-muted-foreground'
}

export function ReleaseDetailModal({
  release,
  isOpen,
  onClose,
  onAddToQueue,
  onPlanBinge,
  onSetReminder,
}: ReleaseDetailModalProps) {
  if (!release) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{release.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {release.type === 'movie' ? (
                  <Film className="h-4 w-4" />
                ) : (
                  <Tv className="h-4 w-4" />
                )}
                <span>{release.service_name}</span>
                <span className="text-gray-400">•</span>
                <span>{release.type === 'movie' ? 'Movie' : 'Series'}</span>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Match score and release date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatReleaseDate(release.release_date)}</span>
            </div>
            <div className="text-center">
              <span className={`text-2xl font-bold ${getMatchColor(release.taste_match_score)}`}>
                {release.taste_match_score}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">Match</span>
            </div>
          </div>

          {/* Genres */}
          {release.genres && release.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {release.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Overview */}
          {release.overview && (
            <p className="text-sm text-muted-foreground">{release.overview}</p>
          )}

          {/* Additional info */}
          {(release.runtime || release.season_count) && (
            <div className="text-sm text-muted-foreground">
              {release.type === 'movie' && release.runtime && (
                <span>{release.runtime} min</span>
              )}
              {release.type === 'series' && release.season_count && (
                <span>{release.season_count} seasons</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onAddToQueue(release)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Queue
            </Button>
            {release.type === 'series' && (
              <Button
                variant="outline"
                onClick={() => onPlanBinge(release)}
              >
                <Play className="h-4 w-4 mr-1" />
                Plan Binge
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onSetReminder(release)}
            >
              <Bell className="h-4 w-4 mr-1" />
              Set Reminder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
