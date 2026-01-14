import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidInviteCode } from '@/lib/household/invite'

/**
 * GET /api/household/invite?code=XXXXX
 * Validate invite code and return household info (public - for joining)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    if (!isValidInviteCode(code)) {
      return NextResponse.json({ error: 'Invalid invite code format' }, { status: 400 })
    }

    const supabase = await createClient()

    // Look up household by invite code
    const { data: household, error } = await supabase
      .from('households')
      .select('id, name, created_at')
      .eq('invite_code', code)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error looking up household:', error)
      return NextResponse.json({ error: 'Failed to look up household' }, { status: 500 })
    }

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    // Return household info without the invite code
    return NextResponse.json({
      id: household.id,
      name: household.name,
      created_at: household.created_at,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/household/invite
 * Join a household via invite code
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
    const { invite_code, display_name } = body

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    if (!isValidInviteCode(invite_code)) {
      return NextResponse.json({ error: 'Invalid invite code format' }, { status: 400 })
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

    // Look up household by invite code
    const { data: household, error: lookupError } = await supabase
      .from('households')
      .select('id, name')
      .eq('invite_code', invite_code)
      .single()

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('Error looking up household:', lookupError)
      return NextResponse.json({ error: 'Failed to look up household' }, { status: 500 })
    }

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    // Add user as member
    const { data: membership, error: joinError } = await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: user.id,
        role: 'member',
        display_name: display_name?.trim() || null,
      })
      .select()
      .single()

    if (joinError) {
      console.error('Error joining household:', joinError)
      return NextResponse.json({ error: 'Failed to join household' }, { status: 500 })
    }

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
