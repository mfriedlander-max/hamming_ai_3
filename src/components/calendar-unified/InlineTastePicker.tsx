'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GENRES } from '@/lib/constants'

interface InlineTastePickerProps {
  onComplete: (genres: string[]) => void | Promise<void>
  onSkip: () => void
  initialGenres?: string[]
}

export function InlineTastePicker({
  onComplete,
  onSkip,
  initialGenres = [],
}: InlineTastePickerProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres)
  const [isSaving, setIsSaving] = useState(false)

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleSave = async () => {
    if (selectedGenres.length === 0) return

    setIsSaving(true)
    try {
      await onComplete(selectedGenres)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Select genres you enjoy
        </h3>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleGenre(genre)}
              aria-label={genre}
              className={selectedGenres.includes(genre) ? 'bg-primary' : ''}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={selectedGenres.length === 0 || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  )
}
