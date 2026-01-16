'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, PauseCircle, PlayCircle, Calendar } from 'lucide-react'
import type { CalendarSavings, CalendarAction } from '@/lib/optimizer-v2/types'

type Savings = CalendarSavings
type ThisWeekAction = CalendarAction

interface OptimizerSummaryProps {
  savings: Savings
  actions: ThisWeekAction[]
  onApplyAll: () => void
  onRegenerate: () => void
  isLoading: boolean
}

function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'pause':
      return <PauseCircle className="h-4 w-4 text-amber-500" />
    case 'resume':
      return <PlayCircle className="h-4 w-4 text-green-500" />
    case 'subscribe':
      return <PlayCircle className="h-4 w-4 text-blue-500" />
    case 'cancel':
      return <PauseCircle className="h-4 w-4 text-red-500" />
    case 'set_reminder':
      return <Calendar className="h-4 w-4 text-purple-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />
  }
}

function formatActionType(actionType: string): string {
  switch (actionType) {
    case 'pause':
      return 'Pause'
    case 'resume':
      return 'Resume'
    case 'subscribe':
      return 'Subscribe'
    case 'cancel':
      return 'Cancel'
    case 'set_reminder':
      return 'Reminder'
    default:
      return actionType
  }
}

export function OptimizerSummary({
  savings,
  actions,
  onApplyAll,
  onRegenerate,
  isLoading,
}: OptimizerSummaryProps) {
  const hasActions = actions.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Optimizer Summary</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button
              size="sm"
              onClick={onApplyAll}
              disabled={isLoading || !hasActions}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Apply All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Savings Display */}
        <div className="flex items-center gap-8 mb-6">
          <div>
            <div className="text-6xl font-bold text-green-600">
              ${savings.annual_savings}
            </div>
            <div className="text-sm text-gray-600">Annual Savings</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Savings potential</span>
              <span className="font-medium">{savings.savings_percentage}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={savings.savings_percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-3 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${savings.savings_percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Current: ${savings.current_annual_cost}/yr</span>
              <span>Optimized: ${savings.optimized_annual_cost}/yr</span>
            </div>
          </div>
        </div>

        {/* This Week's Actions */}
        <div>
          <h3 className="font-medium mb-3">This Week&apos;s Actions</h3>
          {hasActions ? (
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(action.action_type)}
                    <div>
                      <div className="font-medium">{action.service_name}</div>
                      <div className="text-sm text-gray-500">{action.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      {formatActionType(action.action_type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(action.scheduled_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>No actions needed this week!</p>
              <p className="text-sm">Your subscriptions are optimized.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
