// These must match TMDB genre names exactly for content matching to work
export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Science Fiction',
  'Documentary',
  'Romance',
  'Thriller',
  'Animation',
  'Fantasy',
  'Mystery',
  'Crime',
] as const

export type Genre = (typeof GENRES)[number]
