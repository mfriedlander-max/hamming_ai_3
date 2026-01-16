'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthPlan } from '@/lib/optimizer-legacy/types'

interface OptimizedTimelineProps {
  months: MonthPlan[]
}

function formatMonth(monthString: string): string {
  const [, month] = monthString.split('-')
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return monthNames[parseInt(month, 10) - 1] || ''
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function OptimizedTimeline({ months }: OptimizedTimelineProps) {
  if (months.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No schedule available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {months.map((month) => {
              const hasCancel = month.actions.some((a) => a.action === 'cancel')
              const hasSubscribe = month.actions.some((a) => a.action === 'subscribe')

              return (
                <div
                  key={month.month}
                  className="flex flex-col items-center w-16"
                >
                  <span className="text-xs font-medium text-gray-600 mb-2">
                    {formatMonth(month.month)}
                  </span>

                  {/* Service activity indicator */}
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center ${
                      month.active_services.length > 0
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {month.active_services.length > 0 && (
                      <div
                        data-testid="service-indicator"
                        className="w-6 h-6 bg-blue-500 rounded"
                      />
                    )}
                  </div>

                  {/* Action icons */}
                  <div className="h-6 flex items-center justify-center mt-1">
                    {hasCancel && (
                      <span
                        data-testid="action-cancel"
                        className="text-red-500 text-lg"
                        title="Cancel"
                      >
                        ×
                      </span>
                    )}
                    {hasSubscribe && (
                      <span
                        data-testid="action-subscribe"
                        className="text-green-500 text-lg"
                        title="Subscribe"
                      >
                        +
                      </span>
                    )}
                  </div>

                  {/* Monthly cost */}
                  <span className="text-xs text-gray-500 mt-1">
                    {formatCurrency(month.monthly_cost)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
