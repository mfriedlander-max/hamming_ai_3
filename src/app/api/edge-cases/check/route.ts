/**
 * Edge Cases Check API
 *
 * POST /api/edge-cases/check
 *
 * Runs all edge case monitors and returns a summary.
 * Can be called manually or by cron.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getVacationStatus, checkAndAutoDisableVacation } from '@/lib/edge-cases/vacation-mode'
import { getActivitySummary } from '@/lib/edge-cases/activity-monitor'
import { checkQueueHealth } from '@/lib/edge-cases/queue-manager'
import { checkPriceChanges } from '@/lib/edge-cases/price-monitor'
import { detectContentChanges } from '@/lib/edge-cases/content-monitor'
import type { VacationStatus, ActivitySummary, QueueHealth, PriceMonitorResult, ContentMonitorResult } from '@/lib/edge-cases/types'

interface EdgeCaseCheckResponse {
  vacation_status: VacationStatus
  activity_summary: ActivitySummary | null
  queue_health: QueueHealth | null
  price_changes: PriceMonitorResult['changes']
  content_changes: ContentMonitorResult['changes']
  notifications_created: number
  checked_at: string
  skipped_due_to_vacation?: boolean
  errors?: string[]
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const errors: string[] = []
  const now = new Date().toISOString()

  // Check vacation status first
  const vacationStatus = await getVacationStatus(user.id)

  // Auto-disable if return date passed
  await checkAndAutoDisableVacation(user.id)

  // If user is on vacation, return early with minimal data
  if (vacationStatus.is_on_vacation) {
    const response: EdgeCaseCheckResponse = {
      vacation_status: vacationStatus,
      activity_summary: null,
      queue_health: null,
      price_changes: [],
      content_changes: [],
      notifications_created: 0,
      checked_at: now,
      skipped_due_to_vacation: true,
    }

    return NextResponse.json(response)
  }

  // Run all monitors
  let activitySummary: ActivitySummary | null = null
  let queueHealth: QueueHealth | null = null
  let priceChanges: PriceMonitorResult['changes'] = []
  let contentChanges: ContentMonitorResult['changes'] = []

  // Activity summary
  try {
    activitySummary = await getActivitySummary(user.id)
  } catch {
    errors.push('activity_monitor')
  }

  // Queue health
  try {
    queueHealth = await checkQueueHealth(user.id)
  } catch {
    errors.push('queue_manager')
  }

  // Price changes
  try {
    // Get user's subscriptions with service info
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, services(*)')
      .eq('user_id', user.id)

    if (subscriptions && subscriptions.length > 0) {
      const subsWithService = subscriptions.map((sub) => ({
        id: sub.id,
        user_id: sub.user_id,
        service_id: sub.service_id,
        monthly_price: sub.monthly_price,
        service: {
          id: sub.services?.id ?? sub.service_id,
          name: sub.services?.name ?? 'Unknown',
          default_price: sub.services?.default_price ?? sub.monthly_price,
        },
      }))

      const priceResult = await checkPriceChanges(subsWithService)
      priceChanges = priceResult.changes
    }
  } catch {
    errors.push('price_monitor')
  }

  // Content changes
  try {
    const { data: queueItems } = await supabase
      .from('queue_items')
      .select('*')
      .eq('user_id', user.id)

    if (queueItems && queueItems.length > 0) {
      const contentResult = await detectContentChanges(queueItems, {
        tmdbApiKey: process.env.TMDB_API_KEY ?? '',
        storedReleaseDates: {},
        storedStatuses: {},
      })
      contentChanges = contentResult.changes
    }
  } catch {
    errors.push('content_monitor')
  }

  const response: EdgeCaseCheckResponse = {
    vacation_status: vacationStatus,
    activity_summary: activitySummary,
    queue_health: queueHealth,
    price_changes: priceChanges,
    content_changes: contentChanges,
    notifications_created: 0, // TODO: Implement notification creation
    checked_at: now,
    errors: errors.length > 0 ? errors : undefined,
  }

  return NextResponse.json(response)
}
