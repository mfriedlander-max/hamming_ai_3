'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Documentary',
  'Romance',
  'Thriller',
] as const

interface TasteQuizProps {
  onComplete: () => void
  onBack: () => void
  favoriteShows: string
  onFavoriteShowsChange: (shows: string) => void
  selectedGenres: string[]
  onGenresChange: (genres: string[]) => void
  isSubmitting: boolean
}

export function TasteQuiz({
  onComplete,
  onBack,
  favoriteShows,
  onFavoriteShowsChange,
  selectedGenres,
  onGenresChange,
  isSubmitting,
}: TasteQuizProps) {
  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter((g) => g !== genre))
    } else {
      onGenresChange([...selectedGenres, genre])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tell Us Your Taste</h2>
        <p className="text-gray-600 mt-2">
          Help us recommend the best content for you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Favorite Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <label htmlFor="favorite-shows" className="sr-only">
            Favorite Shows
          </label>
          <Input
            id="favorite-shows"
            placeholder="Breaking Bad, The Office, Stranger Things..."
            value={favoriteShows}
            onChange={(e) => onFavoriteShowsChange(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter your favorite shows separated by commas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferred Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENRES.map((genre) => (
              <label
                key={genre}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedGenres.includes(genre)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  aria-label={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">{genre}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} disabled={isSubmitting}>
          {isSubmitting ? 'Completing...' : 'Complete'}
        </Button>
      </div>
    </div>
  )
}
