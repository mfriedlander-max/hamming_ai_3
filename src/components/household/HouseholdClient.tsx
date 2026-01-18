'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HouseholdInsights } from './HouseholdInsights'
import { MembersList } from './MembersList'
import { InviteModal } from './InviteModal'
import { aggregateTasteProfiles } from '@/lib/household/aggregator'
import type { HouseholdWithMembers, TasteProfile } from '@/lib/household/types'

interface HouseholdClientProps {
  household: HouseholdWithMembers
  currentUserId: string
  tasteProfiles: TasteProfile[]
  monthlySpend: number
}

export function HouseholdClient({
  household,
  currentUserId,
  tasteProfiles,
  monthlySpend,
}: HouseholdClientProps) {
  const router = useRouter()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentMember = household.members.find((m) => m.user_id === currentUserId)
  const isOwner = currentMember?.role === 'owner'

  const aggregatedTaste = aggregateTasteProfiles(tasteProfiles)

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/household/members?user_id=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHousehold = async () => {
    if (!confirm('Are you sure you want to delete this household? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/household', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete household')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete household')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{household.name}</h1>
          <p className="text-muted-foreground">Manage your household and shared subscriptions</p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                aria-label="Household settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteHousehold}
                disabled={loading}
                aria-label="Delete household"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights */}
        <HouseholdInsights
          householdName={household.name}
          aggregatedTaste={aggregatedTaste}
          members={household.members}
          monthlySpend={monthlySpend}
        />

        {/* Members */}
        <div className="space-y-4">
          <MembersList
            members={household.members}
            currentUserId={currentUserId}
            isOwner={isOwner}
            onRemoveMember={handleRemoveMember}
            onInvite={() => setInviteModalOpen(true)}
          />
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        inviteCode={household.invite_code}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  )
}
