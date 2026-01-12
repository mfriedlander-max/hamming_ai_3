'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GENRES } from '@/lib/constants'

interface TasteProfileEditorProps {
  initialGenres: string[]
  initialFavoriteShows: string[]
}

export function TasteProfileEditor({
  initialGenres,
  initialFavoriteShows,
}: TasteProfileEditorProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres)
  const [favoriteShows, setFavoriteShows] = useState(initialFavoriteShows.join(', '))
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const shows = favoriteShows
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const response = await fetch('/api/taste-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genres: selectedGenres,
          favorite_shows: shows,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      setMessage({ type: 'success', text: 'Preferences saved! View updated recommendations?' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
            onChange={(e) => setFavoriteShows(e.target.value)}
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

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
          {message.type === 'success' && (
            <a
              href="/recommendations"
              className="ml-2 underline hover:no-underline"
            >
              View recommendations
            </a>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
