'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MonthPlan } from '@/lib/optimizer/types'

interface MonthlyBreakdownProps {
  months: MonthPlan[]
}

function formatMonthFull(monthString: string): string {
  const [year, month] = monthString.split('-')
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function getActionBadgeVariant(
  action: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (action) {
    case 'keep':
      return 'default'
    case 'subscribe':
      return 'secondary'
    case 'cancel':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function MonthlyBreakdown({ months }: MonthlyBreakdownProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  if (months.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No months to display</p>
        </CardContent>
      </Card>
    )
  }

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {months.map((month) => {
          const isExpanded = expandedMonths.has(month.month)
          const serviceCount = month.active_services.length

          return (
            <div
              key={month.month}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleMonth(month.month)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatMonthFull(month.month)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {serviceCount} service{serviceCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatCurrency(month.monthly_cost)}
                  </span>
                  <span className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 py-3 bg-white border-t">
                  {month.actions.length === 0 ? (
                    <p className="text-sm text-gray-500">No actions this month</p>
                  ) : (
                    <ul className="space-y-2">
                      {month.actions.map((action, idx) => (
                        <li
                          key={`${action.service_id}-${idx}`}
                          className="flex items-start gap-3"
                        >
                          <Badge variant={getActionBadgeVariant(action.action)}>
                            {action.action}
                          </Badge>
                          <div>
                            <span className="font-medium">
                              {action.service_name}
                            </span>
                            <p className="text-sm text-gray-600">
                              {action.reason}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
