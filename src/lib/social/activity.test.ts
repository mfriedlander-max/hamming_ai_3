import { describe, it, expect } from 'vitest'
import { formatActivityMessage } from './activity'
import type { ActivityAction } from './types'

describe('formatActivityMessage', () => {
  it('formats subscribed action correctly', () => {
    const result = formatActivityMessage('subscribed', 'Netflix', 'John')
    expect(result).toBe('John subscribed to Netflix')
  })

  it('formats paused action correctly', () => {
    const result = formatActivityMessage('paused', 'Hulu', 'Jane')
    expect(result).toBe('Jane paused Hulu')
  })

  it('formats resumed action correctly', () => {
    const result = formatActivityMessage('resumed', 'Disney+', 'Bob')
    expect(result).toBe('Bob resumed Disney+')
  })

  it('formats cancelled action correctly', () => {
    const result = formatActivityMessage('cancelled', 'HBO Max', 'Alice')
    expect(result).toBe('Alice cancelled HBO Max')
  })

  it('uses "A friend" when user name is null', () => {
    const result = formatActivityMessage('subscribed', 'Netflix', null)
    expect(result).toBe('A friend subscribed to Netflix')
  })

  it('handles all activity actions', () => {
    const actions: ActivityAction[] = ['subscribed', 'paused', 'resumed', 'cancelled']
    actions.forEach((action) => {
      const result = formatActivityMessage(action, 'Service', 'User')
      expect(result).toContain('User')
      expect(result).toContain('Service')
    })
  })
})
