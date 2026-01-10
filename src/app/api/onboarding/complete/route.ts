import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ServiceSelection {
  service_id: string
  monthly_cost: number
}

interface TasteProfile {
  favorite_shows: string[]
  genres: string[]
}

interface OnboardingRequest {
  services: ServiceSelection[]
  taste: TasteProfile
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: OnboardingRequest = await request.json()
    const { services, taste } = body

    // Validate services array
    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service must be selected' },
        { status: 400 }
      )
    }

    // Insert subscriptions for each selected service
    const subscriptionsToInsert = services.map((service) => ({
      user_id: user.id,
      service_id: service.service_id,
      monthly_cost: service.monthly_cost,
      status: 'active',
    }))

    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .insert(subscriptionsToInsert)

    if (subscriptionsError) {
      console.error('Error inserting subscriptions:', subscriptionsError)
      return NextResponse.json(
        { error: 'Failed to save subscriptions' },
        { status: 500 }
      )
    }

    // Upsert taste profile
    const { error: tasteError } = await supabase
      .from('taste_profiles')
      .upsert({
        user_id: user.id,
        favorite_shows: taste.favorite_shows,
        genres: taste.genres,
      }, {
        onConflict: 'user_id',
      })

    if (tasteError) {
      console.error('Error upserting taste profile:', tasteError)
      return NextResponse.json(
        { error: 'Failed to save taste profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
