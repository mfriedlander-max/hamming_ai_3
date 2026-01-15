'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Activity, List, Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FriendsList } from './FriendsList'
import { AddFriendModal } from './AddFriendModal'
import { ActivityFeed } from './ActivityFeed'
import { WatchlistCard } from './WatchlistCard'
import { WatchlistDetail } from './WatchlistDetail'
import type {
  Friend,
  FriendRequest,
  ActivityItem,
  Watchlist,
  WatchlistWithDetails,
} from '@/lib/social/types'

export function SocialClient() {
  // Friends state
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [isFriendsLoading, setIsFriendsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [addFriendOpen, setAddFriendOpen] = useState(false)
  const [addFriendError, setAddFriendError] = useState<string | null>(null)

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [hasMoreActivities, setHasMoreActivities] = useState(false)
  const [isActivityLoading, setIsActivityLoading] = useState(false)
  const [isLoadingMoreActivity, setIsLoadingMoreActivity] = useState(false)
  const [activityOffset, setActivityOffset] = useState(0)

  // Watchlists state
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [isWatchlistsLoading, setIsWatchlistsLoading] = useState(false)
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistWithDetails | null>(null)
  const [isWatchlistDetailLoading, setIsWatchlistDetailLoading] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState('friends')

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    setIsFriendsLoading(true)
    try {
      const res = await fetch('/api/friends')
      if (res.ok) {
        const data = await res.json()
        setFriends(data.friends)
        setPendingRequests(data.pending_requests)
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setIsFriendsLoading(false)
    }
  }, [])

  // Fetch activity
  const fetchActivity = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setIsActivityLoading(true)
    } else {
      setIsLoadingMoreActivity(true)
    }

    try {
      const res = await fetch(`/api/activity?limit=20&offset=${offset}`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setActivities((prev) => [...prev, ...data.activities])
        } else {
          setActivities(data.activities)
        }
        setHasMoreActivities(data.has_more)
        setActivityOffset(offset + data.activities.length)
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setIsActivityLoading(false)
      setIsLoadingMoreActivity(false)
    }
  }, [])

  // Fetch watchlists
  const fetchWatchlists = useCallback(async () => {
    setIsWatchlistsLoading(true)
    try {
      const res = await fetch('/api/watchlists')
      if (res.ok) {
        const data = await res.json()
        setWatchlists(data.watchlists)
      }
    } catch (error) {
      console.error('Failed to fetch watchlists:', error)
    } finally {
      setIsWatchlistsLoading(false)
    }
  }, [])

  // Fetch watchlist detail
  const fetchWatchlistDetail = useCallback(async (id: string) => {
    setIsWatchlistDetailLoading(true)
    try {
      const res = await fetch(`/api/watchlists/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedWatchlist(data)
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
    } finally {
      setIsWatchlistDetailLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'activity' && activities.length === 0) {
      fetchActivity()
    } else if (activeTab === 'watchlists' && watchlists.length === 0) {
      fetchWatchlists()
    }
  }, [activeTab, activities.length, watchlists.length, fetchActivity, fetchWatchlists])

  // Friend handlers
  const handleSendFriendRequest = async (email: string) => {
    setAddFriendError(null)
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json()
      setAddFriendError(data.error || 'Failed to send request')
      throw new Error(data.error)
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    setProcessingIds((prev) => [...prev, friendshipId])
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendshipId, action: 'accept' }),
      })
      if (res.ok) {
        await fetchFriends()
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId))
    }
  }

  const handleDeclineRequest = async (friendshipId: string) => {
    setProcessingIds((prev) => [...prev, friendshipId])
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendshipId, action: 'decline' }),
      })
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId))
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId))
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    setProcessingIds((prev) => [...prev, friendshipId])
    try {
      const res = await fetch(`/api/friends?friendship_id=${friendshipId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== friendshipId))
      }
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId))
    }
  }

  // Watchlist handlers
  const handleCreateWatchlist = async () => {
    const name = prompt('Enter watchlist name:')
    if (!name) return

    const res = await fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      await fetchWatchlists()
    }
  }

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm('Are you sure you want to delete this watchlist?')) return

    const res = await fetch(`/api/watchlists/${watchlistId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId))
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedWatchlist) return

    const res = await fetch(`/api/watchlists/${selectedWatchlist.id}/items?item_id=${itemId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setSelectedWatchlist((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null
      )
    }
  }

  const handleInviteMember = async () => {
    // This would open a modal to invite friends
    alert('Invite member functionality coming soon!')
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="watchlists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Watchlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList
            friends={friends}
            pendingRequests={pendingRequests}
            onRemove={handleRemoveFriend}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            onAddFriend={() => setAddFriendOpen(true)}
            isLoading={isFriendsLoading}
            processingIds={processingIds}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed
            activities={activities}
            hasMore={hasMoreActivities}
            onLoadMore={() => fetchActivity(activityOffset, true)}
            isLoading={isActivityLoading}
            isLoadingMore={isLoadingMoreActivity}
          />
        </TabsContent>

        <TabsContent value="watchlists" className="mt-6">
          {isWatchlistDetailLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-100 rounded w-48" />
              <div className="h-12 bg-gray-100 rounded" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ) : selectedWatchlist ? (
            <WatchlistDetail
              watchlist={selectedWatchlist}
              onBack={() => setSelectedWatchlist(null)}
              onRemoveItem={handleRemoveItem}
              onInviteMember={handleInviteMember}
              isOwner={true} // Would check actual ownership
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Watchlists</h2>
                <Button size="sm" onClick={handleCreateWatchlist}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Watchlist
                </Button>
              </div>

              {isWatchlistsLoading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : watchlists.length === 0 ? (
                <div className="text-center py-12">
                  <List className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No watchlists yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create a watchlist to share with friends
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {watchlists.map((watchlist) => (
                    <WatchlistCard
                      key={watchlist.id}
                      watchlist={watchlist}
                      onClick={(id) => fetchWatchlistDetail(id)}
                      onDelete={handleDeleteWatchlist}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddFriendModal
        open={addFriendOpen}
        onClose={() => {
          setAddFriendOpen(false)
          setAddFriendError(null)
        }}
        onSendRequest={handleSendFriendRequest}
        error={addFriendError}
      />
    </div>
  )
}
