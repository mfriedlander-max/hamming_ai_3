import { createClient } from '@/lib/supabase/server'
import { HouseholdSetup } from '@/components/household/HouseholdSetup'
import { HouseholdClient } from '@/components/household/HouseholdClient'
import { redirect } from 'next/navigation'
import type { HouseholdWithMembers, TasteProfile } from '@/lib/household/types'

async function createHousehold(name: string) {
  'use server'

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/household`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to create household')
  }

  redirect('/household')
}

async function joinHousehold(inviteCode: string) {
  'use server'

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/household/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invite_code: inviteCode }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to join household')
  }

  redirect('/household')
}

export default async function HouseholdPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's household membership
  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select(`
      household_id,
      household:households (
        id,
        name,
        created_by,
        invite_code,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .single()

  // If user is not in a household, show the setup component
  if (membershipError || !membership || !membership.household) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Household</h1>
          <p className="text-muted-foreground">
            Create or join a household to share subscriptions with family members.
          </p>
        </div>
        <HouseholdSetup onCreate={createHousehold} onJoin={joinHousehold} />
      </div>
    )
  }

  // Get all household members with profiles
  const { data: members, error: membersError } = await supabase
    .from('household_members')
    .select(`
      id,
      household_id,
      user_id,
      role,
      display_name,
      joined_at,
      profile:profiles (
        id,
        name
      )
    `)
    .eq('household_id', membership.household_id)

  if (membersError) {
    console.error('Error fetching members:', membersError)
    return (
      <div className="p-8">
        <p className="text-red-600">Failed to load household members.</p>
      </div>
    )
  }

  // Get taste profiles for all household members
  const memberUserIds = (members || []).map((m) => m.user_id)
  const { data: tasteProfiles } = await supabase
    .from('profiles')
    .select('id, taste_profile')
    .in('id', memberUserIds)

  const tasteProfilesForAggregation: TasteProfile[] = (tasteProfiles || [])
    .filter((p) => p.taste_profile)
    .map((p) => ({
      user_id: p.id,
      genres: (p.taste_profile as { genres?: string[] })?.genres || [],
      favorite_shows: (p.taste_profile as { favorite_shows?: string[] })?.favorite_shows || [],
    }))

  // Get total monthly spend from shared subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('monthly_cost')
    .or(`household_id.eq.${membership.household_id},user_id.in.(${memberUserIds.join(',')})`)
    .eq('status', 'active')

  const monthlySpend = (subscriptions || []).reduce(
    (sum, sub) => sum + (sub.monthly_cost || 0),
    0
  )

  const household = membership.household as unknown as {
    id: string
    name: string
    created_by: string | null
    invite_code: string
    created_at: string
  }

  // Transform members to handle the profile array from Supabase
  const transformedMembers = (members || []).map((member) => ({
    ...member,
    profile: Array.isArray(member.profile) ? member.profile[0] : member.profile,
  }))

  const householdWithMembers: HouseholdWithMembers = {
    ...household,
    members: transformedMembers,
  }

  return (
    <div className="p-8">
      <HouseholdClient
        household={householdWithMembers}
        currentUserId={user.id}
        tasteProfiles={tasteProfilesForAggregation}
        monthlySpend={monthlySpend}
      />
    </div>
  )
}
