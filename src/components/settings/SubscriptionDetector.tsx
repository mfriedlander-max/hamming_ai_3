'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DetectedSubscription } from '@/lib/email/types'

interface SubscriptionDetectorProps {
  emailId: string
  onSubscriptionsAdded?: () => void
}

export function SubscriptionDetector({
  emailId,
  onSubscriptionsAdded,
}: SubscriptionDetectorProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [detected, setDetected] = useState<DetectedSubscription[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    setIsScanning(true)
    setError(null)
    setDetected(null)

    try {
      const response = await fetch('/api/subscriptions/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError('Failed to scan for subscriptions')
        return
      }

      setDetected(data.detected)
      // Select all by default
      setSelected(new Set(data.detected.map((d: DetectedSubscription) => d.service_slug)))
    } catch {
      setError('Failed to scan for subscriptions')
    } finally {
      setIsScanning(false)
    }
  }

  const handleToggle = (slug: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(slug)) {
      newSelected.delete(slug)
    } else {
      newSelected.add(slug)
    }
    setSelected(newSelected)
  }

  const handleAddSelected = async () => {
    if (selected.size === 0 || !detected) return

    setIsAdding(true)
    setError(null)

    try {
      // Add each selected subscription
      const selectedServices = detected.filter(d => selected.has(d.service_slug))

      for (const service of selectedServices) {
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_slug: service.service_slug,
          }),
        })

        if (!response.ok) {
          console.error('Failed to add subscription:', service.service_slug)
        }
      }

      onSubscriptionsAdded?.()
      setDetected(null)
      setSelected(new Set())
    } catch {
      setError('Failed to add subscriptions')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Detection</CardTitle>
        <CardDescription>
          Scan your emails to automatically find streaming service subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {!detected && (
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan for Subscriptions'}
          </Button>
        )}

        {detected && detected.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No new subscriptions found.</p>
            <p className="text-sm mt-2">
              All detected services are already in your subscription list.
            </p>
            <Button onClick={handleScan} variant="outline" className="mt-4">
              Scan Again
            </Button>
          </div>
        )}

        {detected && detected.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              {detected.map((sub) => (
                <label
                  key={sub.service_slug}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selected.has(sub.service_slug)
                      ? 'bg-primary/5 border-primary'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    aria-label={sub.service_name}
                    checked={selected.has(sub.service_slug)}
                    onChange={() => handleToggle(sub.service_slug)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{sub.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Detected from {sub.detected_from}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sub.confidence === 'high'
                      ? 'bg-green-100 text-green-700'
                      : sub.confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-accent text-gray-700'
                  }`}>
                    {sub.confidence} confidence
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddSelected}
                disabled={selected.size === 0 || isAdding}
              >
                {isAdding ? 'Adding...' : `Add Selected (${selected.size})`}
              </Button>
              <Button onClick={handleScan} variant="outline" disabled={isScanning}>
                Scan Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
