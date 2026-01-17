// Types for Phase 9 Content Calendar

export interface ContentRelease {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  release_date: string // ISO date string
  poster_url: string | null
  genres: string[]
  friend_watching?: boolean // Social integration: indicates if a friend has this in their queue
}

export interface ServiceReleases {
  service_id: string
  service_name: string
  subscription_id?: string // User's subscription ID for this service (optional for contexts like optimizer)
  releases: ContentRelease[]
}

export interface CalendarMonth {
  month: string // "2026-01"
  services: ServiceReleases[]
}

export interface CalendarResponse {
  months: CalendarMonth[]
}
