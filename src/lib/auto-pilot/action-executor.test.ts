import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeAction, executeActions } from './action-executor'
import type { ThisWeekAction } from '../optimizer-v2/types'

// Mock Supabase with proper chained method handling
const mockEq = vi.fn().mockReturnValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: mockEq }) })
const mockInsert = vi.fn().mockReturnValue({ error: null })
const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'subscriptions') {
    return { update: mockUpdate }
  }
  return { insert: mockInsert }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}))

describe('action-executor', () => {
  const userId = 'user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('executeAction', () => {
    it('creates reminder for set_reminder type', async () => {
      const action: ThisWeekAction = {
        type: 'set_reminder',
        service_id: 'svc-1',
        service_name: 'Netflix',
        date: '2025-02-01',
        reason: 'Cancel before billing',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(true)
      expect(result.autoAction).not.toBeNull()
      expect(result.autoAction?.action_type).toBe('set_reminder')
      expect(result.autoAction?.status).toBe('executed')
    })

    it('updates subscription status for pause type', async () => {
      const action: ThisWeekAction = {
        type: 'pause',
        service_id: 'svc-1',
        service_name: 'Netflix',
        date: '2025-02-01',
        reason: 'No upcoming content',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(true)
      expect(result.autoAction?.action_type).toBe('pause')
      expect(result.autoAction?.status).toBe('executed')
    })

    it('updates subscription status for resume type', async () => {
      const action: ThisWeekAction = {
        type: 'resume',
        service_id: 'svc-1',
        service_name: 'Netflix',
        date: '2025-02-01',
        reason: 'New season starting',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(true)
      expect(result.autoAction?.action_type).toBe('resume')
      expect(result.autoAction?.status).toBe('executed')
    })

    it('handles cancel by creating cancel reminder', async () => {
      const action: ThisWeekAction = {
        type: 'cancel',
        service_id: 'svc-1',
        service_name: 'Hulu',
        date: '2025-02-15',
        reason: 'Finished watching show',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(true)
      expect(result.autoAction?.action_type).toBe('cancel')
      expect(result.autoAction?.status).toBe('executed')
    })

    it('handles subscribe by creating resubscribe reminder', async () => {
      const action: ThisWeekAction = {
        type: 'subscribe',
        service_id: 'svc-1',
        service_name: 'Disney+',
        date: '2025-03-01',
        reason: 'New Marvel series',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(true)
      expect(result.autoAction?.action_type).toBe('subscribe')
      expect(result.autoAction?.status).toBe('executed')
    })

    it('returns error for unknown action type', async () => {
      const action = {
        type: 'unknown_type' as ThisWeekAction['type'],
        service_id: 'svc-1',
        service_name: 'Netflix',
        date: '2025-02-01',
        reason: 'Unknown reason',
      }

      const result = await executeAction(action, userId)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.error_type).toBe('unknown')
    })
  })

  describe('executeActions', () => {
    it('processes multiple actions and returns summary', async () => {
      const actions: ThisWeekAction[] = [
        {
          type: 'pause',
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-01',
          reason: 'No content',
        },
        {
          type: 'set_reminder',
          service_id: 'svc-2',
          service_name: 'Hulu',
          date: '2025-02-05',
          reason: 'Cancel soon',
        },
      ]

      const result = await executeActions(actions, userId)

      expect(result.actions_executed).toBe(2)
      expect(result.actions_failed).toBe(0)
      expect(result.actions_skipped).toBe(0)
    })

    it('continues on individual action failure', async () => {
      const actions: ThisWeekAction[] = [
        {
          type: 'unknown_type' as ThisWeekAction['type'],
          service_id: 'svc-1',
          service_name: 'Netflix',
          date: '2025-02-01',
          reason: 'Will fail',
        },
        {
          type: 'pause',
          service_id: 'svc-2',
          service_name: 'Hulu',
          date: '2025-02-05',
          reason: 'Should succeed',
        },
      ]

      const result = await executeActions(actions, userId)

      expect(result.actions_executed).toBe(1)
      expect(result.actions_failed).toBe(1)
      expect(result.errors.length).toBe(1)
    })
  })
})
