'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WelcomeStep, ServiceSelector, TasteQuiz } from '@/components/onboarding'
import { Loader2 } from 'lucide-react'

interface SelectedService {
  service_id: string
  monthly_cost: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: tasteProfile } = await supabase
          .from('taste_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (tasteProfile) {
          router.replace('/calendar')
          return
        }
      }
      setIsChecking(false)
    }
    checkOnboarding()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  const [step, setStep] = useState(1)
  const [userName, setUserName] = useState('')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [favoriteShows, setFavoriteShows] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          services: selectedServices,
          taste: {
            favorite_shows: favoriteShows
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            genres: selectedGenres,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${
                s === step
                  ? 'bg-primary'
                  : s < step
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-400">Step {step} of 3</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 1 && <WelcomeStep onNext={(name) => { setUserName(name); setStep(2); }} />}

      {step === 2 && (
        <ServiceSelector
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          selectedServices={selectedServices}
          onServicesChange={setSelectedServices}
        />
      )}

      {step === 3 && (
        <TasteQuiz
          onComplete={handleComplete}
          onBack={() => setStep(2)}
          favoriteShows={favoriteShows}
          onFavoriteShowsChange={setFavoriteShows}
          selectedGenres={selectedGenres}
          onGenresChange={setSelectedGenres}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
