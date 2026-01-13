'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, DollarSign, Play } from 'lucide-react'
import type { BingePlan } from '@/lib/binge/types'
import { formatDateRange } from '@/lib/binge/calculator'

interface BingePlanCardProps {
  plan: BingePlan
  onSetReminders: (plan: BingePlan) => void
  loading?: boolean
}

export function BingePlanCard({ plan, onSetReminders, loading }: BingePlanCardProps) {
  const dateRange = formatDateRange(plan.subscribe_date, plan.cancel_date)

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Poster */}
        <div className="w-32 flex-shrink-0 relative min-h-[192px]">
          {plan.poster_url ? (
            <Image
              src={plan.poster_url}
              alt={plan.show_title}
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          ) : (
            <div
              data-testid="poster-placeholder"
              className="w-full h-full bg-gray-200 flex items-center justify-center absolute inset-0"
            >
              <Play className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{plan.show_title}</CardTitle>
            <p className="text-sm text-gray-500">{plan.service_name}</p>
          </CardHeader>

          <CardContent className="pb-2 flex-1">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Play className="h-4 w-4" />
                <span>{plan.total_episodes} episodes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{plan.total_hours} hours</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{dateRange}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-gray-900">
                  ${plan.estimated_cost.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              {plan.days_to_complete} days at {plan.watch_speed} episodes/day
            </p>
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              onClick={() => onSetReminders(plan)}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting...' : 'Set Reminders'}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
