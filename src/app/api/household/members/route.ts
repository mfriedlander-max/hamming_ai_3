import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/household/members
 * List household members with profiles
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
      .select('household_id')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching membership:', membershipError)
      return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of any household' }, { status: 404 })
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

    return NextResponse.json({ members: members || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/household/members?user_id=xxx
 * Remove a member (owner) or leave household (self)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('user_id')

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Get current user's membership
    const { data: membership, error: membershipError } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error fetching membership:', membershipError)
      return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of any household' }, { status: 404 })
    }

    const isSelf = targetUserId === user.id
    const isOwner = membership.role === 'owner'

    // Owner cannot leave (must transfer ownership or delete household)
    if (isSelf && isOwner) {
      return NextResponse.json(
        { error: 'As the owner, you cannot leave. Transfer ownership or delete the household.' },
        { status: 400 }
      )
    }

    // Non-owners can only remove themselves
    if (!isSelf && !isOwner) {
      return NextResponse.json(
        { error: 'Only the owner can remove other members' },
        { status: 403 }
      )
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', membership.household_id)
      .eq('user_id', targetUserId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
