import type { CalendarResponse } from '../calendar/types'
import type {
  OptimizerInput,
  SubscriptionForOptimizer,
  ContentForOptimizer,
  TasteProfileForOptimizer,
} from './types'

interface SubscriptionWithService {
  id: string
  service_id: string
  monthly_cost: number
  status: 'active' | 'paused'
  service: {
    id: string
    name: string
    slug: string
  }
}

interface TasteProfile {
  genres: string[] | null
  favorite_shows: string[] | null
}

/**
 * Aggregate data from subscriptions, taste profile, and calendar
 * into a format suitable for the optimizer prompt.
 */
export function aggregateOptimizerData(
  subscriptions: SubscriptionWithService[],
  tasteProfile: TasteProfile,
  calendar: CalendarResponse,
  startMonth: string
): OptimizerInput {
  // Transform subscriptions
  const optimizerSubscriptions: SubscriptionForOptimizer[] = subscriptions.map(
    (sub) => ({
      id: sub.id,
      service_id: sub.service_id,
      service_name: sub.service.name,
      monthly_cost: sub.monthly_cost,
      status: sub.status,
    })
  )

  // Transform taste profile
  const optimizerTasteProfile: TasteProfileForOptimizer = {
    genres: tasteProfile.genres ?? [],
    favorite_shows: tasteProfile.favorite_shows ?? [],
  }

  // Transform calendar data to content by month
  const contentByMonth = calendar.months.map((month) => ({
    month: month.month,
    services: month.services.map(
      (service): ContentForOptimizer => ({
        service_id: service.service_id,
        service_name: service.service_name,
        releases: service.releases.map((release) => ({
          title: release.title,
          release_date: release.release_date,
          genres: release.genres,
          type: release.type,
        })),
      })
    ),
  }))

  return {
    subscriptions: optimizerSubscriptions,
    taste_profile: optimizerTasteProfile,
    content_by_month: contentByMonth,
    start_month: startMonth,
  }
}
