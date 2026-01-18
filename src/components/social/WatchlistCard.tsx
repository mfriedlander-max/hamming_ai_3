'use client'

import { List, Users, Film, Trash2 } from 'lucide-react'
import type { Watchlist } from '@/lib/social/types'

interface WatchlistCardProps {
  watchlist: Watchlist
  onClick: (watchlistId: string) => void
  onDelete?: (watchlistId: string) => void
}

export function WatchlistCard({ watchlist, onClick, onDelete }: WatchlistCardProps) {
  const memberCount = watchlist.member_count || 0
  const itemCount = watchlist.item_count || 0

  return (
    <div
      className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onClick(watchlist.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(watchlist.id)}
      tabIndex={0}
      role="button"
    >
      {/* Icon */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <List className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{watchlist.name}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className="flex items-center gap-1">
            <Film className="h-3.5 w-3.5" />
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(watchlist.id)
          }}
          aria-label="Delete watchlist"
          className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
