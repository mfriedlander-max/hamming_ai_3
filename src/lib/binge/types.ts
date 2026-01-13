import type { TMDBShowDetails } from '@/lib/tmdb/types'

export interface BingePlan {
  show_id: number
  show_title: string
  service_id: string
  service_name: string
  total_episodes: number
  total_hours: number
  days_to_complete: number
  subscribe_date: string // ISO date YYYY-MM-DD
  cancel_date: string // ISO date YYYY-MM-DD
  estimated_cost: number
  watch_speed: number // episodes per day used
  poster_url: string | null
}

export interface BingePlanInput {
  show: TMDBShowDetails
  service: {
    id: string
    name: string
    monthly_cost: number
  }
  release_date: string // ISO date YYYY-MM-DD
  watch_speed: number // 1-6 episodes per day
}

export interface BingeService {
  id: string
  name: string
  monthly_cost: number
}
