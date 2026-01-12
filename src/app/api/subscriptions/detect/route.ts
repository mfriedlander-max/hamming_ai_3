import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/errors'
import { detectSubscriptions, filterExistingSubscriptions } from '@/lib/email/detector'

// POST: Scan connected email for subscription patterns
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { email_id } = body

    if (!email_id) {
      return errorResponse('email_id is required', 400)
    }

    // Verify the email belongs to this user
    const { data: emailRecord, error: emailError } = await supabase
      .from('user_emails')
      .select('id, email, access_token')
      .eq('id', email_id)
      .eq('user_id', user.id)
      .single()

    if (emailError || !emailRecord) {
      return errorResponse('Connected email not found', 404)
    }

    // Get user's existing subscriptions
    const { data: existingSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('service:services(slug)')
      .eq('user_id', user.id)

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
      return errorResponse('Failed to fetch subscriptions', 500)
    }

    // Extract existing service slugs
    const existingSlugs = (existingSubs || [])
      .map((sub) => {
        // Supabase nested select can return array or single object
        const serviceData = sub.service as unknown
        const service = Array.isArray(serviceData) ? serviceData[0] : serviceData as { slug: string } | null
        return service?.slug
      })
      .filter((slug): slug is string => slug !== undefined)

    // Detect subscriptions from emails (uses mock in dev)
    const detected = detectSubscriptions(emailRecord.access_token || undefined)

    // Filter out services user already has
    const filtered = filterExistingSubscriptions(detected, existingSlugs)

    return NextResponse.json({ detected: filtered })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
