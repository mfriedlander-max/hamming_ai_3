import type { OptimizerInputs, OptimizedPlan } from './types'

const PLAN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Generate a hash of optimizer inputs for cache invalidation
 */
export function hashOptimizerInputs(inputs: OptimizerInputs): string {
  const relevant = {
    subscriptions: inputs.subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
    })),
    taste_profile: inputs.taste_profile,
    watch_time: inputs.watch_time,
    watchlist_count: inputs.watchlist_items.length,
    watchlist_ids: inputs.watchlist_items.map((i) => i.tmdb_id).sort(),
    friend_shares_count: inputs.friend_shares.length,
    friend_shares_ids: inputs.friend_shares.map((s) => s.tmdb_id).sort(),
    binge_plans_count: inputs.binge_plans.length,
    binge_plans_ids: inputs.binge_plans.map((p) => p.show_id).sort(),
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
 * Check if a plan has expired (older than 1 hour)
 */
export function isPlanExpired(plan: OptimizedPlan): boolean {
  const generatedAt = new Date(plan.generated_at).getTime()
  const now = Date.now()
  return now - generatedAt > PLAN_EXPIRY_MS
}

/**
 * Determine if plan needs recalculation
 */
export function shouldRecalculate(
  inputs: OptimizerInputs,
  existingPlan: OptimizedPlan | null
): boolean {
  // No plan exists
  if (!existingPlan) {
    return true
  }

  // Plan is expired
  if (isPlanExpired(existingPlan)) {
    return true
  }

  // Inputs have changed
  const currentHash = hashOptimizerInputs(inputs)
  if (currentHash !== existingPlan.inputs_hash) {
    return true
  }

  return false
}
