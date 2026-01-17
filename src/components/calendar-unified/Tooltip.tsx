'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TooltipProps {
  id: string
  title: string
  content: string
  isVisible: boolean
  onDismiss: () => void
  autoHideMs?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({
  title,
  content,
  isVisible,
  onDismiss,
  autoHideMs,
  position = 'bottom',
}: TooltipProps) {
  useEffect(() => {
    if (!isVisible || !autoHideMs) return

    const timer = setTimeout(() => {
      onDismiss()
    }, autoHideMs)

    return () => clearTimeout(timer)
  }, [isVisible, autoHideMs, onDismiss])

  if (!isVisible) return null

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
  }

  return (
    <div
      className={`absolute z-50 ${positionClasses[position]}`}
      role="tooltip"
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-gray-300 text-xs mt-1">{content}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onDismiss}
            className="w-full text-xs"
          >
            Got it
          </Button>
        </div>
      </div>
      {/* Arrow */}
      <div
        className={`absolute border-8 ${arrowClasses[position]}`}
      />
    </div>
  )
}
