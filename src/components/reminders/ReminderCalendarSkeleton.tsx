import { Skeleton } from '@/components/ui/skeleton'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ReminderCalendarSkeleton() {
  // Generate 35 cells (5 weeks) for a typical month view
  const calendarCells = Array.from({ length: 35 }, (_, i) => i)

  return (
    <div className="w-full bg-card rounded-lg border">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        {/* Previous button skeleton */}
        <Skeleton className="h-8 w-8 rounded-md" />

        {/* Month/Year skeleton */}
        <Skeleton className="h-6 w-32" />

        {/* Next button skeleton */}
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarCells.map((index) => (
          <div
            key={index}
            className="min-h-[80px] p-1 border-b border-r"
          >
            {/* Day number skeleton */}
            <Skeleton className="h-4 w-4 mb-1" />

            {/* Occasional reminder indicator skeletons (show on some cells) */}
            {index % 7 === 2 && (
              <Skeleton className="h-4 w-16 mt-1" />
            )}
            {index % 11 === 5 && (
              <Skeleton className="h-4 w-14 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
