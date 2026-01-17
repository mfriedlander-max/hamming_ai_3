'use client'

import { useState, useCallback } from 'react'
import {
  addToQueue,
  removeFromQueue,
  planBinge,
  watchTogether,
  setReminder,
  applyAllActions,
  regeneratePlan,
  reorderQueue,
} from './action-handlers'

interface ReleaseData {
  id: string
  tmdb_id: number
  title: string
  content_type: 'movie' | 'tv'
  service_id: string
  service_name: string
  duration_minutes: number
  poster_path?: string
}

interface BingeShowData {
  tmdb_id: number
  title: string
  service_id: string
  service_name: string
  poster_path?: string
}

interface QueueReorderItem {
  id: string
  priority: number
}

interface UseCalendarActionsOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCalendarActions(options: UseCalendarActionsOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { onSuccess, onError } = options

  const wrapAction = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await action()
        onSuccess?.()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, onError]
  )

  const handleAddToQueue = useCallback(
    (release: ReleaseData) => wrapAction(() => addToQueue(release)),
    [wrapAction]
  )

  const handleRemoveFromQueue = useCallback(
    (queueItemId: string) => wrapAction(() => removeFromQueue(queueItemId)),
    [wrapAction]
  )

  const handlePlanBinge = useCallback(
    (show: BingeShowData) => wrapAction(() => planBinge(show)),
    [wrapAction]
  )

  const handleWatchTogether = useCallback(
    (queueItemId: string, friendIds: string[], scheduledDate?: string, message?: string) =>
      wrapAction(() => watchTogether(queueItemId, friendIds, scheduledDate, message)),
    [wrapAction]
  )

  const handleSetReminder = useCallback(
    (releaseDate: string, serviceId: string) =>
      wrapAction(() => setReminder(releaseDate, serviceId)),
    [wrapAction]
  )

  const handleApplyAll = useCallback(
    () => wrapAction(() => applyAllActions()),
    [wrapAction]
  )

  const handleRegenerate = useCallback(
    () => wrapAction(() => regeneratePlan()),
    [wrapAction]
  )

  const handleReorderQueue = useCallback(
    (items: QueueReorderItem[]) => wrapAction(() => reorderQueue(items)),
    [wrapAction]
  )

  return {
    isLoading,
    error,
    handleAddToQueue,
    handleRemoveFromQueue,
    handlePlanBinge,
    handleWatchTogether,
    handleSetReminder,
    handleApplyAll,
    handleRegenerate,
    handleReorderQueue,
  }
}
