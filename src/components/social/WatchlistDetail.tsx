'use client'

import Image from 'next/image'
import { ArrowLeft, UserPlus, X, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WatchlistWithDetails, WatchlistItem } from '@/lib/social/types'

interface WatchlistDetailProps {
  watchlist: WatchlistWithDetails
  onBack: () => void
  onRemoveItem: (itemId: string) => void
  onInviteMember: () => void
  isOwner: boolean
  canEdit?: boolean
}

function getInitial(name: string | null | undefined, email: string | undefined): string {
  if (name) return name.charAt(0).toUpperCase()
  if (email) return email.charAt(0).toUpperCase()
  return '?'
}

function ItemCard({
  item,
  onRemove,
  canRemove,
}: {
  item: WatchlistItem
  onRemove: (id: string) => void
  canRemove: boolean
}) {
  const isMovie = item.content_type === 'movie'
  const Icon = isMovie ? Film : Tv

  return (
    <div className="flex gap-3 p-3 bg-card rounded-lg border border-border hover:border-gray-300 transition-colors">
      {/* Poster or placeholder */}
      <div className="flex-shrink-0 w-16 h-24 bg-accent rounded overflow-hidden relative">
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
            alt={item.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground capitalize">{item.content_type}</p>
        {item.added_by_name && (
          <p className="text-xs text-gray-400 mt-2">Added by {item.added_by_name}</p>
        )}
      </div>

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
          className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors self-start"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function WatchlistDetail({
  watchlist,
  onBack,
  onRemoveItem,
  onInviteMember,
  isOwner,
  canEdit = true,
}: WatchlistDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to watchlists"
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">{watchlist.name}</h2>
        </div>

        {isOwner && (
          <Button size="sm" variant="outline" onClick={onInviteMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      {/* Member avatars */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Members:</span>
        <div className="flex -space-x-2">
          {watchlist.members.slice(0, 5).map((member) => (
            <div
              key={member.user_id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white"
              title={member.user_name || member.user_email}
            >
              {getInitial(member.user_name, member.user_email)}
            </div>
          ))}
          {watchlist.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium ring-2 ring-white">
              +{watchlist.members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {watchlist.items.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No items yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add movies and shows to this watchlist
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {watchlist.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRemove={onRemoveItem}
              canRemove={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
