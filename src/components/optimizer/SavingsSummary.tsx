'use client'

import { Card, CardContent } from '@/components/ui/card'

interface SavingsSummaryProps {
  currentCost: number
  optimizedCost: number
  savings: number
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function SavingsSummary({
  currentCost,
  optimizedCost,
  savings,
}: SavingsSummaryProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Current Annual Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentCost)}
            </p>
          </div>

          <div className="hidden md:block text-2xl text-gray-400">→</div>

          <div className="text-center">
            <p className="text-sm text-gray-500">Optimized Annual Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(optimizedCost)}
            </p>
          </div>

          <div
            data-testid="savings-amount"
            className="text-center bg-green-50 px-6 py-3 rounded-lg"
          >
            <p className="text-sm text-green-700">Annual Savings</p>
            <p className="text-2xl font-bold text-green-600">
              Save {formatCurrency(savings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
