'use client'

import { Film, Tv, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AggregatedTaste, HouseholdMemberWithProfile } from '@/lib/household/types'

interface HouseholdInsightsProps {
  householdName: string
  aggregatedTaste: AggregatedTaste
  members: HouseholdMemberWithProfile[]
  monthlySpend: number
}

export function HouseholdInsights({
  householdName,
  aggregatedTaste,
  members,
  monthlySpend,
}: HouseholdInsightsProps) {
  const genreCount = aggregatedTaste.genres.length
  const showCount = aggregatedTaste.favorite_shows.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {householdName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Member Avatars */}
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member) => {
            const name = member.display_name || member.profile?.name || 'U'
            const initial = name.charAt(0).toUpperCase()
            return (
              <div
                key={member.id}
                data-testid="member-avatar"
                className="h-10 w-10 rounded-full bg-muted border-2 border-white flex items-center justify-center text-muted-foreground font-medium"
                title={name}
              >
                {initial}
              </div>
            )
          })}
          {members.length > 5 && (
            <div className="h-10 w-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-muted-foreground text-sm font-medium">
              +{members.length - 5}
            </div>
          )}
        </div>

        {/* Monthly Spend */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Household Spend</p>
            <p className="text-xl font-bold text-foreground">${monthlySpend.toFixed(2)}</p>
          </div>
        </div>

        {/* Combined Genres */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Film className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-gray-700">
              {genreCount > 0 ? `${genreCount} genres` : 'No genres'} combined
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {aggregatedTaste.genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {genreCount === 0 && (
              <span className="text-sm text-muted-foreground">Add taste profiles to see combined genres</span>
            )}
          </div>
        </div>

        {/* Combined Shows */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tv className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-gray-700">
              {showCount > 0 ? `${showCount} shows` : 'No shows'} across household
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {aggregatedTaste.favorite_shows.slice(0, 10).map((show) => (
              <Badge key={show} variant="outline" className="text-xs">
                {show}
              </Badge>
            ))}
            {showCount > 10 && (
              <Badge variant="outline" className="text-xs">
                +{showCount - 10} more
              </Badge>
            )}
            {showCount === 0 && (
              <span className="text-sm text-muted-foreground">Add taste profiles to see combined shows</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
