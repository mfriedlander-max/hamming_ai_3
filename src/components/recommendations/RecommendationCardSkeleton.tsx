import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RecommendationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          {/* Service name skeleton */}
          <Skeleton className="h-6 w-28" />
          {/* Recommendation badge skeleton */}
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Reason text skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Top matches skeleton */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {/* Quick Pause button skeleton */}
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  )
}
