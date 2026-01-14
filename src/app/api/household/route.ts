import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/household/invite'
import type { HouseholdWithMembers } from '@/lib/household/types'

/**
 * GET /api/household
 * Fetch the current user's household with members
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's household membership
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

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching membership:', membershipError)
      return NextResponse.json({ error: 'Failed to fetch household' }, { status: 500 })
    }

    if (!membership || !membership.household) {
      return NextResponse.json({ household: null })
    }

    // Get all members of the household with their profiles
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
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

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

    return NextResponse.json({ household: householdWithMembers })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/household
 * Create a new household (generates invite code, adds creator as owner)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Household name is required' }, { status: 400 })
    }

    // Check if user is already in a household
    const { data: existingMembership, error: checkError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking membership:', checkError)
      return NextResponse.json({ error: 'Failed to check existing membership' }, { status: 500 })
    }

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of a household' },
        { status: 409 }
      )
    }

    // Generate invite code
    const inviteCode = generateInviteCode()

    // Create household
    const { data: household, error: createError } = await supabase
      .from('households')
      .insert({
        name: name.trim(),
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating household:', createError)
      return NextResponse.json({ error: 'Failed to create household' }, { status: 500 })
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: user.id,
        role: 'owner',
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error adding member:', memberError)
      // Rollback household creation
      await supabase.from('households').delete().eq('id', household.id)
      return NextResponse.json({ error: 'Failed to add you as owner' }, { status: 500 })
    }

    return NextResponse.json(household, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/household
 * Update household name (owner only)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Household name is required' }, { status: 400 })
    }

    // Get user's membership to verify ownership
    const { data: membership, error: membershipError } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching membership:', membershipError)
      return NextResponse.json({ error: 'Failed to verify membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of any household' }, { status: 404 })
    }

    if (membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can update the household' }, { status: 403 })
    }

    // Update household name
    const { data: updated, error: updateError } = await supabase
      .from('households')
      .update({ name: name.trim() })
      .eq('id', membership.household_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating household:', updateError)
      return NextResponse.json({ error: 'Failed to update household' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/household
 * Delete household (owner only)
 */
export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's membership to verify ownership
    const { data: membership, error: membershipError } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching membership:', membershipError)
      return NextResponse.json({ error: 'Failed to verify membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of any household' }, { status: 404 })
    }

    if (membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can delete the household' }, { status: 403 })
    }

    // Delete household (cascades to members via FK)
    const { error: deleteError } = await supabase
      .from('households')
      .delete()
      .eq('id', membership.household_id)

    if (deleteError) {
      console.error('Error deleting household:', deleteError)
      return NextResponse.json({ error: 'Failed to delete household' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
