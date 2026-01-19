'use client'

import { useState, useEffect } from 'react'
import { OptimizerSummary } from './OptimizerSummary'
import { WatchQueue } from './WatchQueue'
import { CalendarView } from './CalendarView'
import { UpcomingReleases } from './UpcomingReleases'
import { ReleaseDetailModal } from './ReleaseDetailModal'
import { EmptyState } from './EmptyState'
import { FirstSavingsPopup, hasSeenFirstSavings } from './FirstSavingsPopup'
import { WatchTogetherModal } from './WatchTogetherModal'
import { Loader2 } from 'lucide-react'
import type {
  CalendarOptimizedPlan,
  CalendarWatchSlot,
  CalendarAction,
  CalendarSavings,
  CalendarSubscriptionWindow,
  ContentRelease,
} from '@/lib/optimizer-v2/types'
import type { FriendInfo, WatchTogetherInput } from '@/lib/social-integration/types'

type OptimizedPlan = CalendarOptimizedPlan
type WatchSlot = CalendarWatchSlot
type ThisWeekAction = CalendarAction
type Savings = CalendarSavings
type SubscriptionWindow = CalendarSubscriptionWindow

interface Service {
  id: string
  name: string
  default_price: number
}

interface ContentCalendarPageProps {
  plan: OptimizedPlan | null
  releases: ContentRelease[]
  isLoading: boolean
  onApplyAll: () => void
  onRegenerate: () => void
  onRemoveFromQueue: (intentId: string) => void
  onAddToQueue: (release: ContentRelease) => void
  // New user experience props
  hasSubscriptions?: boolean
  hasTasteProfile?: boolean
  services?: Service[]
  onGenreSelect?: (genres: string[]) => void
  onServiceAdd?: (serviceId: string, price: number) => void
  // Social integration props
  onWatchTogether?: (queueItemId: string, friendIds: string[], scheduledDate?: string, message?: string) => Promise<void>
}

const emptySavings: Savings = {
  current_annual_cost: 0,
  optimized_annual_cost: 0,
  annual_savings: 0,
  savings_percentage: 0,
}

export function ContentCalendarPage({
  plan,
  releases,
  isLoading,
  onApplyAll,
  onRegenerate,
  onRemoveFromQueue,
  onAddToQueue,
  hasSubscriptions = true,
  hasTasteProfile = true,
  services = [],
  onGenreSelect,
  onServiceAdd,
  onWatchTogether,
}: ContentCalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRelease, setSelectedRelease] = useState<ContentRelease | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emptyStateStep, setEmptyStateStep] = useState(1)
  const [firstSavingsPopupDismissed, setFirstSavingsPopupDismissed] = useState(false)

  // Watch Together modal state
  const [watchTogetherSlot, setWatchTogetherSlot] = useState<WatchSlot | null>(null)
  const [isWatchTogetherModalOpen, setIsWatchTogetherModalOpen] = useState(false)
  const [friends, setFriends] = useState<FriendInfo[]>([])

  // Fetch friends when component mounts
  useEffect(() => {
    async function fetchFriends() {
      try {
        const response = await fetch('/api/friends')
        if (response.ok) {
          const data = await response.json()
          // Transform to FriendInfo format
          setFriends(
            (data.friends || []).map((f: { user_id: string; name: string | null; email: string }) => ({
              id: f.user_id,
              name: f.name || 'Unknown',
              email: f.email,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error)
      }
    }
    fetchFriends()
  }, [])

  // Check if this is a new user (no subscriptions or taste profile)
  const isNewUser = !hasSubscriptions || !hasTasteProfile

  // Extract data from plan or use defaults
  const savings: Savings = plan?.savings ?? emptySavings

  // Compute whether to show first savings popup
  const showFirstSavingsPopup =
    plan !== null &&
    savings.annual_savings > 0 &&
    !hasSeenFirstSavings() &&
    !isNewUser &&
    !firstSavingsPopupDismissed
  const watchQueue: WatchSlot[] = plan?.watch_queue ?? []
  const subscriptionWindows: SubscriptionWindow[] = plan?.subscription_windows ?? []
  const thisWeekActions: ThisWeekAction[] = plan?.this_week_actions ?? []

  const handleSelectRelease = (release: ContentRelease) => {
    setSelectedRelease(release)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRelease(null)
  }

  const handlePlanBinge = (slot: WatchSlot) => {
    // TODO: Implement binge planning
    console.log('Plan binge for:', slot.title)
  }

  const handleAddToWatchlist = (slot: WatchSlot) => {
    // TODO: Implement add to watchlist
    console.log('Add to watchlist:', slot.title)
  }

  const handleSetReminder = (release: ContentRelease) => {
    // TODO: Implement set reminder
    console.log('Set reminder for:', release.title)
    handleCloseModal()
  }

  const handleAddToQueueFromModal = (release: ContentRelease) => {
    onAddToQueue(release)
    handleCloseModal()
  }

  const handlePlanBingeFromModal = (release: ContentRelease) => {
    // TODO: Implement binge planning from modal
    console.log('Plan binge from modal for:', release.title)
    handleCloseModal()
  }

  // Empty state handlers
  const handleGenreSelect = (genres: string[]) => {
    onGenreSelect?.(genres)
    setEmptyStateStep(2)
  }

  const handleServiceAdd = (serviceId: string, price: number) => {
    onServiceAdd?.(serviceId, price)
    setEmptyStateStep(3)
  }

  const handleSkipToCalendar = () => {
    // User wants to skip the guided setup
    setEmptyStateStep(3)
  }

  // Watch Together handlers
  const handleOpenWatchTogether = (slot: WatchSlot) => {
    setWatchTogetherSlot(slot)
    setIsWatchTogetherModalOpen(true)
  }

  const handleCloseWatchTogether = () => {
    setIsWatchTogetherModalOpen(false)
    setWatchTogetherSlot(null)
  }

  const handleWatchTogetherSubmit = async (input: Omit<WatchTogetherInput, 'queue_item_id'>) => {
    if (!watchTogetherSlot || !onWatchTogether) return
    await onWatchTogether(
      watchTogetherSlot.intent_id,
      input.friend_ids,
      input.scheduled_date,
      input.message
    )
    handleCloseWatchTogether()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading your optimized plan...</p>
        </div>
      </div>
    )
  }

  // Show empty state for new users
  if (isNewUser && emptyStateStep < 3) {
    return (
      <EmptyState
        currentStep={emptyStateStep}
        services={services}
        onGenreSelect={handleGenreSelect}
        onServiceAdd={handleServiceAdd}
        onSkipToCalendar={handleSkipToCalendar}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Optimizer Summary */}
      <div data-tooltip="savings">
        <OptimizerSummary
          savings={savings}
          actions={thisWeekActions}
          onApplyAll={onApplyAll}
          onRegenerate={onRegenerate}
          isLoading={isLoading}
        />
      </div>

      {/* Section 2: Watch Queue */}
      <div data-tooltip="queue">
        <WatchQueue
          slots={watchQueue}
          onRemove={onRemoveFromQueue}
          onPlanBinge={handlePlanBinge}
          onAddToWatchlist={handleAddToWatchlist}
          onWatchTogether={onWatchTogether ? handleOpenWatchTogether : undefined}
        />
      </div>

      {/* Section 3: Calendar View */}
      <div data-tooltip="calendar">
        <CalendarView
          windows={subscriptionWindows}
          releases={releases}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onSelectRelease={handleSelectRelease}
        />
      </div>

      {/* Section 4: Upcoming Releases */}
      <div data-tooltip="releases">
        <UpcomingReleases
          releases={releases}
          onAddToQueue={onAddToQueue}
          onViewDetails={handleSelectRelease}
        />
      </div>

      {/* Release Detail Modal */}
      <ReleaseDetailModal
        release={selectedRelease}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToQueue={handleAddToQueueFromModal}
        onPlanBinge={handlePlanBingeFromModal}
        onSetReminder={handleSetReminder}
      />

      {/* First Savings Celebration Popup */}
      <FirstSavingsPopup
        savingsAmount={savings.annual_savings}
        isVisible={showFirstSavingsPopup}
        onDismiss={() => setFirstSavingsPopupDismissed(true)}
      />

      {/* Watch Together Modal */}
      <WatchTogetherModal
        isOpen={isWatchTogetherModalOpen}
        onClose={handleCloseWatchTogether}
        onSubmit={handleWatchTogetherSubmit}
        friends={friends}
        contentTitle={watchTogetherSlot?.title || ''}
      />
    </div>
  )
}
