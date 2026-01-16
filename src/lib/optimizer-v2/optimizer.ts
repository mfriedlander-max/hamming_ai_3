import type { OptimizerInputs, OptimizedPlan, WatchIntent } from './types'
import { buildWatchIntents } from './intent-builder'
import { prioritizeIntents } from './prioritizer'
import { scheduleIntents } from './scheduler'
import { optimizeSubscriptions } from './subscription-optimizer'
import { generateThisWeekActions } from './action-generator'

/**
 * Generate a hash of the inputs for cache invalidation
 */
function hashInputs(inputs: OptimizerInputs): string {
  const relevant = {
    subscriptions: inputs.subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
    })),
    taste_profile: inputs.taste_profile,
    watch_time: inputs.watch_time,
    watchlist_count: inputs.watchlist_items.length,
    friend_shares_count: inputs.friend_shares.length,
    binge_plans_count: inputs.binge_plans.length,
    content_releases_count: inputs.content_releases.length,
  }

  // Simple hash using JSON stringify
  const str = JSON.stringify(relevant)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
}

/**
 * Build intent-to-service mapping for subscription optimization
 */
function buildIntentServiceMap(intents: WatchIntent[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const intent of intents) {
    if (intent.service_id) {
      map.set(intent.id, intent.service_id)
    }
  }
  return map
}

/**
 * Main optimizer function: generates a complete optimized plan
 */
export function generateOptimizedPlan(inputs: OptimizerInputs): OptimizedPlan {
  const now = new Date()
  const startDate = now.toISOString().split('T')[0]

  // Step 1: Build watch intents from all sources
  const rawIntents = buildWatchIntents(inputs)

  // Step 2: Prioritize intents
  const prioritizedIntents = prioritizeIntents(rawIntents)

  // Step 3: Schedule intents into time slots
  const scheduleResult = scheduleIntents(
    prioritizedIntents,
    startDate,
    inputs.watch_time
  )

  // Step 4: Build intent-service map for scheduled intents
  const intentServiceMap = buildIntentServiceMap(prioritizedIntents)

  // Step 5: Optimize subscriptions based on schedule
  const subscriptionResult = optimizeSubscriptions(
    scheduleResult.schedule,
    intentServiceMap,
    inputs.subscriptions
  )

  // Step 6: Generate this week's actions
  const thisWeekActions = generateThisWeekActions(
    subscriptionResult.windows,
    inputs.subscriptions
  )

  // Build the final plan
  return {
    generated_at: now.toISOString(),
    inputs_hash: hashInputs(inputs),
    watch_intents: prioritizedIntents,
    watch_schedule: scheduleResult.schedule,
    subscription_windows: subscriptionResult.windows,
    this_week_actions: thisWeekActions,
    savings: subscriptionResult.savings,
    conflicts: scheduleResult.overload?.overloaded
      ? [
          {
            type: 'overloaded_schedule',
            description: `Schedule is overloaded by ${scheduleResult.overload.overflow_minutes} minutes`,
            affected_intents: scheduleResult.unscheduled.map((i) => i.id),
            suggested_resolution: `Consider removing ${scheduleResult.overload.suggested_cuts.length} lower-priority items`,
          },
        ]
      : undefined,
  }
}
