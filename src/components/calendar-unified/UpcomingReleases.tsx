'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Film, Tv, Users, Sparkles } from 'lucide-react'

interface ContentRelease {
  id: string
  title: string
  release_date: string
  service_id: string
  service_name: string
  type: 'movie' | 'series'
  taste_match_score: number
  poster_path?: string
  friend_watching?: boolean
}

interface UpcomingReleasesProps {
  releases: ContentRelease[]
  onAddToQueue: (release: ContentRelease) => void
  onViewDetails: (release: ContentRelease) => void
}

function formatReleaseDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-muted-foreground'
}

export function UpcomingReleases({
  releases,
  onAddToQueue,
  onViewDetails,
}: UpcomingReleasesProps) {
  const hasReleases = releases.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Upcoming Releases
          {hasReleases && (
            <Badge variant="secondary" className="ml-auto">
              {releases.length} upcoming
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasReleases ? (
          <div className="space-y-3">
            {releases.map((release) => (
              <div
                key={release.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                {/* Poster placeholder */}
                <div className="w-12 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                  {release.type === 'movie' ? (
                    <Film className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Tv className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <button
                    className="text-left w-full"
                    onClick={() => onViewDetails(release)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{release.title}</span>
                      {release.friend_watching && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <Users className="h-3 w-3 mr-1" />
                          Friend watching
                        </Badge>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{release.service_name}</span>
                    <span className="text-gray-400">•</span>
                    <span>{formatReleaseDate(release.release_date)}</span>
                    <span className="text-gray-400">•</span>
                    <Badge variant="outline" className="text-xs">
                      {release.type === 'movie' ? 'Movie' : 'Series'}
                    </Badge>
                  </div>
                </div>

                {/* Match score */}
                <div className="text-center shrink-0">
                  <div className={`text-lg font-bold ${getMatchColor(release.taste_match_score)}`}>
                    {release.taste_match_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Match</div>
                </div>

                {/* Add button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToQueue(release)
                  }}
                  title="Add to queue"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add to queue</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No upcoming releases</p>
            <p className="text-sm">Check back later for new content</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
