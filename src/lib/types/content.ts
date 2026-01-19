// Shared types for Phase 4 (Content) and Phase 5 (Recommendations)

export interface MatchedContent {
  id: string
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  release_date: string
  genres: string[]
  poster_url?: string // TMDB poster path
  match_score: number // 0-100
  match_reason: string // e.g., "Matches your sci-fi taste"
}

export interface ServiceContent {
  service_id: string
  service_name: string
  upcoming: MatchedContent[]
}

export interface Recommendation {
  service_id: string
  verdict: 'keep' | 'pause' | 'consider'
  top_matches: string[]
  reason: string
  resume_date?: string // ISO date for pause recommendations
}
