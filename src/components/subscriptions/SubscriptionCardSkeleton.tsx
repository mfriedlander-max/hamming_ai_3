import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
            {/* Title skeleton */}
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            {/* Recommendation badge skeleton */}
            <Skeleton className="h-5 w-14" />
            {/* Status badge skeleton */}
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price skeleton */}
        <Skeleton className="h-8 w-20" />
      </CardContent>
      <CardFooter className="flex gap-2">
        {/* Pause/Resume button skeleton */}
        <Skeleton className="h-8 w-16" />
        {/* Set Reminder button skeleton */}
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}
