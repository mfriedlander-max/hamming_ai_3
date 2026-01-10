import { cn } from '@/lib/utils'

export type SubscriptionStatus = 'active' | 'paused'

interface StatusBadgeProps {
  status: SubscriptionStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isActive = status === 'active'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {isActive ? 'Active' : 'Paused'}
    </span>
  )
}
