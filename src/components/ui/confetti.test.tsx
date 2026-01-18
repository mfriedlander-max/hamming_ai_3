import { describe, it, expect, vi } from 'vitest'
import { fireConfetti } from './confetti'

// Mock canvas-confetti module
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => Promise.resolve())
}))

describe('fireConfetti', () => {
  it('is callable without throwing', async () => {
    // Should not throw when called
    await expect(fireConfetti()).resolves.not.toThrow()
  })
})
