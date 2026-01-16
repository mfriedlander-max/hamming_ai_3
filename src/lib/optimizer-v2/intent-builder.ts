import type {
  WatchIntent,
  OptimizerInputs,
  ContentReleaseInput,
  WatchlistItemInput,
  FriendShareInput,
  BingePlanInput,
  TasteProfile,
  UserSubscription,
} from './types'

/**
 * Calculate taste match score based on genre overlap
 * +20 per matching genre, max 60
 */
function calculateGenreScore(
  contentGenres: string[],
  userGenres: string[]
): number {
  const matches = contentGenres.filter((g) => userGenres.includes(g)).length
  return Math.min(matches * 20, 60)
}

/**
 * Check if content title matches any favorite show
 */
function matchesFavorite(title: string, favorites: string[]): boolean {
  const normalizedTitle = title.toLowerCase()
  return favorites.some((fav) => normalizedTitle.includes(fav.toLowerCase()))
}

/**
 * Find which subscribed service has this content
 */
function findService(
  serviceIds: string[],
  subscriptions: UserSubscription[]
): UserSubscription | undefined {
  return subscriptions.find(
    (sub) => sub.status === 'active' && serviceIds.includes(sub.service_id)
  )
}

export function buildFromTasteMatches(
  releases: ContentReleaseInput[],
  tasteProfile: TasteProfile,
  subscriptions: UserSubscription[]
): WatchIntent[] {
  const intents: WatchIntent[] = []

  for (const release of releases) {
    const service = findService(release.service_ids, subscriptions)
    if (!service) continue

    const score = calculateGenreScore(release.genres, tasteProfile.genres)
    if (score === 0) continue

    intents.push({
      id: crypto.randomUUID(),
      tmdb_id: release.tmdb_id,
      title: release.title,
      type: release.type,
      source: 'taste_match',
      service_id: service.service_id,
      service_name: service.service_name,
      release_date: release.release_date,
      poster_path: release.poster_path,
      runtime_minutes: release.runtime_minutes ?? 0,
      episode_count: release.episode_count,
      taste_match_score: score,
      priority_score: 0, // Calculated later by prioritizer
    })
  }

  return intents
}

export function buildFromWatchlist(
  items: WatchlistItemInput[],
  _subscriptions: UserSubscription[]
): WatchIntent[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    tmdb_id: item.tmdb_id,
    title: item.title,
    type: item.content_type,
    source: 'watchlist' as const,
    source_details: item.added_by_friend
      ? {
          friend_id: item.added_by_friend.id,
          friend_name: item.added_by_friend.name,
        }
      : undefined,
    service_id: '', // Will be resolved when content data is available
    service_name: '',
    release_date: null,
    poster_path: item.poster_path,
    runtime_minutes: 0,
    taste_match_score: 0,
    priority_score: 0,
  }))
}

export function buildFromFriendShares(
  shares: FriendShareInput[],
  _subscriptions: UserSubscription[]
): WatchIntent[] {
  return shares.map((share) => ({
    id: crypto.randomUUID(),
    tmdb_id: share.tmdb_id,
    title: share.title,
    type: share.content_type,
    source: 'friend_share' as const,
    source_details: {
      friend_id: share.friend_id,
      friend_name: share.friend_name,
    },
    service_id: '',
    service_name: '',
    release_date: null,
    poster_path: null,
    runtime_minutes: 0,
    taste_match_score: 0,
    priority_score: 0,
  }))
}

export function buildFromBingePlans(plans: BingePlanInput[]): WatchIntent[] {
  return plans.map((plan) => ({
    id: crypto.randomUUID(),
    tmdb_id: plan.show_id,
    title: plan.show_title,
    type: 'tv' as const,
    source: 'binge_plan' as const,
    source_details: {
      binge_plan_id: crypto.randomUUID(),
    },
    service_id: plan.service_id,
    service_name: plan.service_name,
    release_date: plan.subscribe_date,
    poster_path: plan.poster_url,
    runtime_minutes: 0,
    episode_count: plan.total_episodes,
    taste_match_score: 0,
    priority_score: 0,
    deadline: plan.cancel_date,
    deadline_reason: `Binge plan: complete ${plan.total_episodes} episodes before subscription ends`,
  }))
}

export function buildFromFavorites(
  releases: ContentReleaseInput[],
  tasteProfile: TasteProfile,
  subscriptions: UserSubscription[]
): WatchIntent[] {
  const intents: WatchIntent[] = []

  for (const release of releases) {
    if (!matchesFavorite(release.title, tasteProfile.favorite_shows)) continue

    const service = findService(release.service_ids, subscriptions)
    if (!service) continue

    intents.push({
      id: crypto.randomUUID(),
      tmdb_id: release.tmdb_id,
      title: release.title,
      type: release.type,
      source: 'favorite',
      service_id: service.service_id,
      service_name: service.service_name,
      release_date: release.release_date,
      poster_path: release.poster_path,
      runtime_minutes: release.runtime_minutes ?? 0,
      episode_count: release.episode_count,
      taste_match_score: 100, // Favorites get max score
      priority_score: 0,
    })
  }

  return intents
}

/**
 * Deduplicate intents by tmdb_id, keeping highest priority source
 * Priority order: binge_plan > friend_share > favorite > watchlist > taste_match
 */
function deduplicateIntents(intents: WatchIntent[]): WatchIntent[] {
  const sourceOrder: Record<string, number> = {
    binge_plan: 1,
    friend_share: 2,
    favorite: 3,
    watchlist: 4,
    taste_match: 5,
  }

  const byTmdbId = new Map<number, WatchIntent>()

  for (const intent of intents) {
    const existing = byTmdbId.get(intent.tmdb_id)
    if (!existing || sourceOrder[intent.source] < sourceOrder[existing.source]) {
      byTmdbId.set(intent.tmdb_id, intent)
    }
  }

  return Array.from(byTmdbId.values())
}

/**
 * Main orchestrator: build watch intents from all sources
 */
export function buildWatchIntents(inputs: OptimizerInputs): WatchIntent[] {
  const tasteMatchIntents = buildFromTasteMatches(
    inputs.content_releases,
    inputs.taste_profile,
    inputs.subscriptions
  )

  const watchlistIntents = buildFromWatchlist(
    inputs.watchlist_items,
    inputs.subscriptions
  )

  const friendShareIntents = buildFromFriendShares(
    inputs.friend_shares,
    inputs.subscriptions
  )

  const bingePlanIntents = buildFromBingePlans(inputs.binge_plans)

  const favoriteIntents = buildFromFavorites(
    inputs.content_releases,
    inputs.taste_profile,
    inputs.subscriptions
  )

  const allIntents = [
    ...bingePlanIntents,
    ...friendShareIntents,
    ...favoriteIntents,
    ...watchlistIntents,
    ...tasteMatchIntents,
  ]

  return deduplicateIntents(allIntents)
}
