import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCalendarActions } from './use-calendar-actions'
import * as actionHandlers from './action-handlers'

vi.mock('./action-handlers', () => ({
  addToQueue: vi.fn(),
  removeFromQueue: vi.fn(),
  planBinge: vi.fn(),
  watchTogether: vi.fn(),
  setReminder: vi.fn(),
  applyAllActions: vi.fn(),
  regeneratePlan: vi.fn(),
  reorderQueue: vi.fn(),
}))

describe('useCalendarActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles addToQueue with loading state', async () => {
    const mockItem = { id: 'queue-1', title: 'Test' }
    vi.mocked(actionHandlers.addToQueue).mockResolvedValue({ item: mockItem })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onSuccess }))

    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.handleAddToQueue({
        id: 'release-1',
        tmdb_id: 12345,
        title: 'Test',
        content_type: 'tv',
        service_id: 'service-1',
        service_name: 'Netflix',
        duration_minutes: 300,
      })
    })

    expect(actionHandlers.addToQueue).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handles removeFromQueue', async () => {
    vi.mocked(actionHandlers.removeFromQueue).mockResolvedValue({ success: true })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onSuccess }))

    await act(async () => {
      await result.current.handleRemoveFromQueue('queue-1')
    })

    expect(actionHandlers.removeFromQueue).toHaveBeenCalledWith('queue-1')
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handles planBinge', async () => {
    vi.mocked(actionHandlers.planBinge).mockResolvedValue({
      item: { id: 'queue-1' },
      binge_plan: {
        total_episodes: 10,
        episode_runtime: 45,
        days_to_complete: 5,
        deadline: '2026-01-20',
        watch_speed: 2,
      },
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onSuccess }))

    await act(async () => {
      await result.current.handlePlanBinge({
        tmdb_id: 12345,
        title: 'Breaking Bad',
        service_id: 'service-1',
        service_name: 'Netflix',
      })
    })

    expect(actionHandlers.planBinge).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handles applyAllActions', async () => {
    vi.mocked(actionHandlers.applyAllActions).mockResolvedValue({
      message: 'Applied',
      actions_applied: 3,
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onSuccess }))

    await act(async () => {
      await result.current.handleApplyAll()
    })

    expect(actionHandlers.applyAllActions).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handles regeneratePlan', async () => {
    vi.mocked(actionHandlers.regeneratePlan).mockResolvedValue({
      message: 'Plan invalidated',
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onSuccess }))

    await act(async () => {
      await result.current.handleRegenerate()
    })

    expect(actionHandlers.regeneratePlan).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handles errors with onError callback', async () => {
    vi.mocked(actionHandlers.addToQueue).mockRejectedValue(new Error('API error'))

    const onError = vi.fn()
    const { result } = renderHook(() => useCalendarActions({ onError }))

    await act(async () => {
      await result.current.handleAddToQueue({
        id: 'release-1',
        tmdb_id: 12345,
        title: 'Test',
        content_type: 'tv',
        service_id: 'service-1',
        service_name: 'Netflix',
        duration_minutes: 300,
      })
    })

    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})
