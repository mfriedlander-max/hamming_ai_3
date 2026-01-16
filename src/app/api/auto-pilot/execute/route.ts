import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeActions } from '@/lib/auto-pilot/action-executor'
import { checkDeadlines } from '@/lib/auto-pilot/deadline-detector'
import { handleAllDeadlines } from '@/lib/auto-pilot/deadline-handler'
import type { ThisWeekAction, OptimizedPlan, WatchIntent } from '@/lib/optimizer-v2/types'
import type { ExecutionResult } from '@/lib/auto-pilot/types'

/**
 * POST /api/auto-pilot/execute
 *
 * Execute scheduled auto-pilot actions for the current user.
 * Called by Vercel cron job daily at 9 AM (UTC).
 *
 * Body:
 * - dry_run?: boolean - If true, return what would be executed without executing
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dry_run } = await request.json()

  // 1. Fetch user's cached optimizer plan
  const { data: planData, error: planError } = await supabase
    .from('optimizer_plans')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (planError || !planData?.plan) {
    return NextResponse.json({
      result: {
        actions_executed: 0,
        actions_skipped: 0,
        actions_failed: 0,
        notifications_sent: 0,
        errors: [],
      },
      message: 'No optimizer plan found',
    })
  }

  const plan = planData.plan as OptimizedPlan

  // 2. Get today's actions from this_week_actions
  const today = new Date().toISOString().split('T')[0]
  const todaysActions = (plan.this_week_actions || []).filter(
    (action: ThisWeekAction) => action.date === today
  )

  // 3. Check for missed/upcoming deadlines
  const watchIntents = (plan.watch_intents || []) as WatchIntent[]
  const deadlineResult = checkDeadlines(watchIntents, new Date(), user.id)

  // 4. If dry_run, return what would be executed
  if (dry_run) {
    return NextResponse.json({
      dry_run: true,
      would_execute: todaysActions,
      deadline_check: deadlineResult,
      message: 'Dry run - no actions executed',
    })
  }

  // 5. Execute actions
  let executionResult: ExecutionResult = {
    actions_executed: 0,
    actions_skipped: 0,
    actions_failed: 0,
    notifications_sent: 0,
    errors: [],
  }

  if (todaysActions.length > 0) {
    executionResult = await executeActions(todaysActions, user.id)
  }

  // 6. Handle deadlines
  const deadlineHandled = await handleAllDeadlines(deadlineResult, user.id)
  executionResult.notifications_sent += deadlineHandled.notifications_sent

  // 7. Calculate next execution time (tomorrow 9 AM UTC)
  const nextExecution = new Date()
  nextExecution.setUTCDate(nextExecution.getUTCDate() + 1)
  nextExecution.setUTCHours(9, 0, 0, 0)

  return NextResponse.json({
    result: executionResult,
    next_execution: nextExecution.toISOString(),
  })
}
