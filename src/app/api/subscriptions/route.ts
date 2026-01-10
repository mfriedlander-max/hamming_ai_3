import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        user_id,
        service_id,
        status,
        monthly_cost,
        created_at,
        service:services (
          id,
          name,
          slug,
          logo_url,
          default_price,
          tmdb_provider_id,
          cancel_url
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { service_id, monthly_cost } = body

    if (!service_id) {
      return NextResponse.json({ error: 'service_id is required' }, { status: 400 })
    }

    if (typeof monthly_cost !== 'number' || monthly_cost < 0) {
      return NextResponse.json({ error: 'monthly_cost must be a positive number' }, { status: 400 })
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_id', service_id)
      .single()

    if (existingSubscription) {
      return NextResponse.json({ error: 'Subscription already exists for this service' }, { status: 409 })
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        service_id,
        monthly_cost,
        status: 'active',
      })
      .select(
        `
        id,
        user_id,
        service_id,
        status,
        monthly_cost,
        created_at,
        service:services (
          id,
          name,
          slug,
          logo_url,
          default_price,
          tmdb_provider_id,
          cancel_url
        )
      `
      )
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
