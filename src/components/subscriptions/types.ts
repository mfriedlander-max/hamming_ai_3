import type { SubscriptionStatus } from './StatusBadge'

export interface Service {
  id: string
  name: string
  slug: string
  logo_url: string | null
  default_price: number
  tmdb_provider_id: number | null
  cancel_url: string | null
}

export interface Subscription {
  id: string
  user_id: string
  service_id: string
  status: SubscriptionStatus
  monthly_cost: number
  created_at: string
}

export interface SubscriptionWithService extends Subscription {
  service: Service
}
