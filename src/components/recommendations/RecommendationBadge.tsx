import { cn } from '@/lib/utils'
import type { Recommendation } from '@/lib/types/content'

export type Verdict = Recommendation['verdict']

interface RecommendationBadgeProps {
  verdict: Verdict
  className?: string
  size?: 'sm' | 'lg'
}

const verdictConfig: Record<
  Verdict,
  { label: string; bgColor: string; textColor: string }
> = {
  keep: {
    label: 'Keep',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  pause: {
    label: 'Pause',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  consider: {
    label: 'Consider',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export function RecommendationBadge({
  verdict,
  className,
  size = 'sm',
}: RecommendationBadgeProps) {
  const config = verdictConfig[verdict]

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  )
}
