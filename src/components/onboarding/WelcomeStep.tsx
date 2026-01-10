'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface WelcomeStepProps {
  onNext: (name: string) => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [name, setName] = useState('')

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
          <div className="space-y-2">
            <label htmlFor="name-input" className="text-sm font-medium text-gray-700">
              What should we call you?
            </label>
            <Input
              id="name-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center"
            />
          </div>
          <Button size="lg" onClick={() => onNext(name)}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
