'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SavingsSummary } from './SavingsSummary'
import { OptimizedTimeline } from './OptimizedTimeline'
import { MonthlyBreakdown } from './MonthlyBreakdown'
import type { OptimizedSchedule } from '@/lib/optimizer/types'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'applying' | 'applied'

export function OptimizerClient() {
  const [status, setStatus] = useState<Status>('idle')
  const [schedule, setSchedule] = useState<OptimizedSchedule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applyResult, setApplyResult] = useState<{
    reminders_created: number
    subscriptions_updated: number
  } | null>(null)

  const generatePlan = async (forceRefresh = false) => {
    setStatus('loading')
    setError(null)

    try {
      const response = await fetch('/api/optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setSchedule(data.schedule)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
      setStatus('error')
    }
  }

  const applyPlan = async () => {
    if (!schedule) return

    setStatus('applying')
    setError(null)

    try {
      const response = await fetch('/api/optimizer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply plan')
      }

      setApplyResult(data)
      setStatus('applied')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply plan')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Initial state or error */}
      {status === 'idle' && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              Generate an optimized 12-month subscription schedule based on your
              taste profile and upcoming content.
            </p>
            <Button onClick={() => generatePlan()}>Generate Optimized Plan</Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-pulse">
              <p className="text-gray-600">Generating your optimized plan...</p>
              <p className="text-sm text-gray-400 mt-2">
                Analyzing content calendar and taste profile
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {status === 'error' && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Failed to generate plan: {error}</p>
            <Button onClick={() => generatePlan()}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Success state - show results */}
      {(status === 'success' || status === 'applying' || status === 'applied') &&
        schedule && (
          <>
            <SavingsSummary
              currentCost={schedule.current_annual_cost}
              optimizedCost={schedule.optimized_annual_cost}
              savings={schedule.savings}
            />

            <OptimizedTimeline months={schedule.months} />

            <MonthlyBreakdown months={schedule.months} />

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              {status === 'success' && (
                <>
                  <Button onClick={applyPlan}>Apply Plan</Button>
                  <Button variant="outline" onClick={() => generatePlan(true)}>
                    Regenerate
                  </Button>
                </>
              )}

              {status === 'applying' && (
                <Button disabled>Applying plan...</Button>
              )}

              {status === 'applied' && applyResult && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-green-600 text-center">
                      Plan applied successfully!
                    </p>
                    <p className="text-sm text-gray-600 text-center mt-2">
                      {applyResult.reminders_created} reminders created,{' '}
                      {applyResult.subscriptions_updated} subscriptions updated
                    </p>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button variant="outline" onClick={() => generatePlan(true)}>
                        Regenerate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
    </div>
  )
}
