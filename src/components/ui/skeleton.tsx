import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pulse' | 'shimmer'
}

function Skeleton({ className, variant = 'pulse', ...props }: SkeletonProps) {
  return (
    <>
      {variant === 'shimmer' && (
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground) 50%, var(--muted) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      )}
      <div
        className={cn(
          'rounded-md bg-muted',
          variant === 'pulse' ? 'animate-pulse' : 'animate-shimmer',
          className
        )}
        {...props}
      />
    </>
  )
}

export { Skeleton }
