export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Documentary',
  'Romance',
  'Thriller',
] as const

export type Genre = (typeof GENRES)[number]
