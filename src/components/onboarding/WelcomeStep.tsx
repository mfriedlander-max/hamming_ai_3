'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl">
            Welcome to SubCycle
          </CardTitle>
          <CardDescription className="text-lg">
            Manage your streaming subscriptions smarter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Track all your streaming services in one place, get personalized content
            recommendations, and never pay for a subscription you&apos;re not using.
          </p>
          <Button size="lg" onClick={onNext}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
