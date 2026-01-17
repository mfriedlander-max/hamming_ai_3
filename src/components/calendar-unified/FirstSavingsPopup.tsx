'use client'

import { PartyPopper, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STORAGE_KEY = 'subcycle_first_savings_celebrated'

interface FirstSavingsPopupProps {
  savingsAmount: number
  isVisible: boolean
  onDismiss: () => void
}

export function FirstSavingsPopup({
  savingsAmount,
  isVisible,
  onDismiss,
}: FirstSavingsPopupProps) {
  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    onDismiss()
  }

  if (!isVisible) return null

  const formattedSavings = Math.round(savingsAmount)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4 relative overflow-hidden">
        {/* Decorative confetti-like background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full" />
          <div className="absolute bottom-12 left-8 w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute top-12 right-4 w-3 h-3 bg-pink-400 rounded-full" />
          <div className="absolute bottom-8 right-12 w-2 h-2 bg-purple-400 rounded-full" />
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="pt-8 pb-6 px-6 text-center relative">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <PartyPopper className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Congratulations!
          </h2>

          <p className="text-gray-600 mb-4">
            You could save
          </p>

          <div className="mb-4">
            <span className="text-5xl font-bold text-green-600">
              ${formattedSavings}
            </span>
            <span className="text-gray-500 text-lg ml-1">per year</span>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            by optimizing your streaming subscriptions
          </p>

          <Button onClick={handleDismiss} className="w-full" size="lg">
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function hasSeenFirstSavings(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}
