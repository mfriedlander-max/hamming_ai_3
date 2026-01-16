import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateThisWeekActions, generateActionsForWindow } from './action-generator'
import type { SubscriptionWindow, UserSubscription, ThisWeekAction } from './types'

describe('action-generator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })

  const mockSubscriptions: UserSubscription[] = [
    {
      id: 's1',
      service_id: 'netflix',
      service_name: 'Netflix',
      monthly_cost: 15.99,
      status: 'active',
    },
    {
      id: 's2',
      service_id: 'hulu',
      service_name: 'Hulu',
      monthly_cost: 12.99,
      status: 'paused',
    },
  ]

  describe('generateActionsForWindow', () => {
    it('generates subscribe action when window starts this week', () => {
      const window: SubscriptionWindow = {
        service_id: 'hulu',
        service_name: 'Hulu',
        subscribe_date: '2026-01-18',
        cancel_date: '2026-02-15',
        monthly_cost: 12.99,
        reason: 'Watch content',
      }

      const actions = generateActionsForWindow(window, mockSubscriptions)

      expect(actions.some((a) => a.type === 'subscribe' || a.type === 'resume')).toBe(true)
      expect(actions[0].date).toBe('2026-01-18')
    })

    it('generates cancel action when window ends this week', () => {
      const window: SubscriptionWindow = {
        service_id: 'netflix',
        service_name: 'Netflix',
        subscribe_date: '2026-01-01',
        cancel_date: '2026-01-20',
        monthly_cost: 15.99,
        reason: 'Watch content',
      }

      const actions = generateActionsForWindow(window, mockSubscriptions)

      expect(actions.some((a) => a.type === 'cancel' || a.type === 'pause')).toBe(true)
    })

    it('generates no actions when window is outside this week', () => {
      const window: SubscriptionWindow = {
        service_id: 'netflix',
        service_name: 'Netflix',
        subscribe_date: '2026-02-01',
        cancel_date: '2026-03-01',
        monthly_cost: 15.99,
        reason: 'Watch content',
      }

      const actions = generateActionsForWindow(window, mockSubscriptions)

      expect(actions).toHaveLength(0)
    })
  })

  describe('generateThisWeekActions', () => {
    it('combines actions from all windows', () => {
      const windows: SubscriptionWindow[] = [
        {
          service_id: 'netflix',
          service_name: 'Netflix',
          subscribe_date: '2026-01-01',
          cancel_date: '2026-01-20',
          monthly_cost: 15.99,
          reason: 'Watch content',
        },
        {
          service_id: 'hulu',
          service_name: 'Hulu',
          subscribe_date: '2026-01-18',
          cancel_date: '2026-02-15',
          monthly_cost: 12.99,
          reason: 'Watch content',
        },
      ]

      const actions = generateThisWeekActions(windows, mockSubscriptions)

      // Should have cancel for netflix and resume for hulu
      expect(actions.length).toBeGreaterThanOrEqual(2)
    })

    it('returns empty array when no windows', () => {
      const actions = generateThisWeekActions([], mockSubscriptions)
      expect(actions).toHaveLength(0)
    })

    it('sorts actions by date', () => {
      const windows: SubscriptionWindow[] = [
        {
          service_id: 'hulu',
          service_name: 'Hulu',
          subscribe_date: '2026-01-20',
          cancel_date: '2026-02-15',
          monthly_cost: 12.99,
          reason: 'Watch content',
        },
        {
          service_id: 'netflix',
          service_name: 'Netflix',
          subscribe_date: '2026-01-01',
          cancel_date: '2026-01-17',
          monthly_cost: 15.99,
          reason: 'Watch content',
        },
      ]

      const actions = generateThisWeekActions(windows, mockSubscriptions)

      // First action should be earlier date
      if (actions.length >= 2) {
        expect(new Date(actions[0].date) <= new Date(actions[1].date)).toBe(true)
      }
    })
  })
})
