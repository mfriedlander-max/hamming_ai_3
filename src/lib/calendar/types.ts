// Types for Phase 9 Content Calendar

export interface ContentRelease {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  release_date: string // ISO date string
  poster_url: string | null
  genres: string[]
}

export interface ServiceReleases {
  service_id: string
  service_name: string
  releases: ContentRelease[]
}

export interface CalendarMonth {
  month: string // "2026-01"
  services: ServiceReleases[]
}

export interface CalendarResponse {
  months: CalendarMonth[]
}
