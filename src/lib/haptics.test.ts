import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerHaptic } from './haptics'

describe('triggerHaptic', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  it('does not throw when navigator.vibrate is unavailable', () => {
    // Mock navigator without vibrate
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: undefined },
      configurable: true,
    })

    // Should not throw
    expect(() => triggerHaptic('light')).not.toThrow()
    expect(() => triggerHaptic('medium')).not.toThrow()
    expect(() => triggerHaptic('heavy')).not.toThrow()
  })
})
