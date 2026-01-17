/**
 * Vacation Mode API
 *
 * GET /api/vacation-mode - Get current vacation status
 * POST /api/vacation-mode - Enable/disable vacation mode
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getVacationStatus,
  enableVacationMode,
  disableVacationMode,
} from '@/lib/edge-cases/vacation-mode'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getVacationStatus(user.id)

  return NextResponse.json(status)
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
  const { enabled, return_date } = body

  if (enabled) {
    await enableVacationMode(user.id, return_date)
  } else {
    await disableVacationMode(user.id)
  }

  const status = await getVacationStatus(user.id)

  return NextResponse.json({ success: true, status })
}
