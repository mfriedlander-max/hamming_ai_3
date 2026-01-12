import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/errors'

// GET: List connected email accounts
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const { data: emails, error } = await supabase
      .from('user_emails')
      .select('id, email, provider, created_at')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching connected emails:', error)
      return errorResponse('Failed to fetch connected emails', 500)
    }

    return NextResponse.json({ emails: emails || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST: Connect a new email account
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

    // In dev/mock mode, use the user's auth email
    // In production with real OAuth, this would exchange the code for tokens
    if (body.mock) {
      const { data, error } = await supabase
        .from('user_emails')
        .insert({
          user_id: user.id,
          email: user.email,
          provider: 'gmail',
        })
        .select()
        .single()

      if (error) {
        console.error('Error connecting email:', error)
        return errorResponse('Failed to connect email', 500)
      }

      return NextResponse.json({ success: true, email: data.email })
    }

    // Real OAuth flow would go here
    // For now, return an error since OAuth is a deployment concern
    return errorResponse('OAuth not configured. Use mock mode for development.', 501)
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE: Disconnect an email account
export async function DELETE(request: Request) {
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

    const { error } = await supabase
      .from('user_emails')
      .delete()
      .eq('id', email_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error disconnecting email:', error)
      return errorResponse('Failed to disconnect email', 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
