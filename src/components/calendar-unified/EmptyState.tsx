'use client'

import { useState } from 'react'
import { Calendar, Sparkles, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GENRES } from '@/lib/constants'

interface EmptyStateProps {
  onGenreSelect: (genres: string[]) => void
  onServiceAdd: (serviceId: string, price: number) => void
  onSkipToCalendar: () => void
  currentStep?: number
  services?: Array<{ id: string; name: string; default_price: number }>
}

export function EmptyState({
  onGenreSelect,
  onServiceAdd,
  onSkipToCalendar,
  currentStep = 1,
  services = [],
}: EmptyStateProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [servicePrice, setServicePrice] = useState('')

  const steps = [
    { number: 1, label: 'Select your genres', icon: Sparkles },
    { number: 2, label: 'Add a subscription', icon: Calendar },
    { number: 3, label: 'See your savings', icon: DollarSign },
  ]

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleGenreContinue = () => {
    if (selectedGenres.length > 0) {
      onGenreSelect(selectedGenres)
    }
  }

  const handleAddService = () => {
    if (selectedService && servicePrice) {
      onServiceAdd(selectedService, parseFloat(servicePrice))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to SubCycle
        </h1>
        <p className="text-muted-foreground text-lg">
          Start saving on streaming subscriptions in 3 easy steps
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span
              className={`ml-2 text-sm ${
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-muted mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                What genres do you enjoy?
              </h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {GENRES.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleGenre(genre)}
                    aria-label={genre}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={onSkipToCalendar}>
                  Skip
                </Button>
                <Button
                  onClick={handleGenreContinue}
                  disabled={selectedGenres.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Which streaming service do you use?
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="service-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Service
                  </label>
                  <select
                    id="service-select"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="price-input"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly price ($)
                  </label>
                  <input
                    id="price-input"
                    type="number"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="9.99"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={onSkipToCalendar}>
                  Skip
                </Button>
                <Button
                  onClick={handleAddService}
                  disabled={!selectedService || !servicePrice}
                >
                  Add Service
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-4">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-lg font-semibold mb-2">
                Calculating your savings...
              </h2>
              <p className="text-muted-foreground">
                We&apos;re analyzing your subscriptions to find the best schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
