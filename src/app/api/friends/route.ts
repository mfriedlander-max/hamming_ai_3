import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FriendsResponse, Friend, FriendRequest } from '@/lib/social/types'

export async function GET(): Promise<NextResponse<FriendsResponse | { error: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all friendships where user is either requester or addressee
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      requester:profiles!friendships_requester_id_fkey(id, name),
      addressee:profiles!friendships_addressee_id_fkey(id, name)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (error) {
    console.error('Error fetching friendships:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }

  // Process into friends and pending requests
  const friends: Friend[] = []
  const pending_requests: FriendRequest[] = []

  for (const friendship of friendships || []) {
    // Supabase returns joined tables as arrays
    const requesterArr = friendship.requester as { id: string; name: string | null }[] | null
    const addresseeArr = friendship.addressee as { id: string; name: string | null }[] | null
    const requester = Array.isArray(requesterArr) ? requesterArr[0] : requesterArr
    const addressee = Array.isArray(addresseeArr) ? addresseeArr[0] : addresseeArr

    if (friendship.status === 'accepted') {
      // Determine which user is the friend
      const isFriendRequester = friendship.requester_id !== user.id
      const friendProfile = isFriendRequester ? requester : addressee

      if (friendProfile) {
        friends.push({
          id: friendship.id,
          user_id: friendProfile.id,
          name: friendProfile.name,
          friends_since: friendship.created_at,
        })
      }
    } else if (friendship.status === 'pending' && friendship.addressee_id === user.id) {
      // Only show pending requests where user is the addressee
      if (requester) {
        pending_requests.push({
          id: friendship.id,
          requester_id: friendship.requester_id,
          requester_name: requester.name,
          created_at: friendship.created_at,
        })
      }
    }
  }

  return NextResponse.json({ friends, pending_requests })
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { user_id, name } = body

  // Support lookup by user_id or name
  let targetUser: { id: string } | null = null

  if (user_id) {
    // Direct lookup by user_id
    const { data, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (!userError && data) {
      targetUser = data
    }
  } else if (name) {
    // Lookup by name (case-insensitive)
    const { data, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('name', name)
      .single()

    if (!userError && data) {
      targetUser = data
    }
  } else {
    return NextResponse.json({ error: 'user_id or name is required' }, { status: 400 })
  }

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if trying to add self
  if (targetUser.id === user.id) {
    return NextResponse.json({ error: 'You cannot add yourself as a friend' }, { status: 400 })
  }

  // Check if friendship already exists (in either direction)
  const { data: existingFriendship } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},addressee_id.eq.${user.id})`
    )
    .single()

  if (existingFriendship) {
    if (existingFriendship.status === 'accepted') {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 })
    } else if (existingFriendship.status === 'pending') {
      return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 })
    }
  }

  // Create friend request
  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: targetUser.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating friend request:', error)
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { friendship_id, action } = body

  if (!friendship_id) {
    return NextResponse.json({ error: 'friendship_id is required' }, { status: 400 })
  }

  if (!action || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Use "accept" or "decline"' }, { status: 400 })
  }

  const newStatus = action === 'accept' ? 'accepted' : 'declined'

  // Update friendship status (only if user is the addressee)
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', friendship_id)
    .eq('addressee_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating friendship:', error)
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const friendship_id = url.searchParams.get('friendship_id')

  if (!friendship_id) {
    return NextResponse.json({ error: 'friendship_id is required' }, { status: 400 })
  }

  // Delete friendship (user must be either requester or addressee)
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendship_id)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (error) {
    console.error('Error deleting friendship:', error)
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
