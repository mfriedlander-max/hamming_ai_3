import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DarkModeToggle } from './DarkModeToggle'

describe('DarkModeToggle', () => {
  const mockLocalStorage: Record<string, string> = {}

  beforeEach(() => {
    // Reset document classes
    document.documentElement.classList.remove('dark')

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockLocalStorage[key] || null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value
    })

    // Clear mock storage
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('toggles between light and dark mode', () => {
    render(<DarkModeToggle />)

    const toggle = screen.getByRole('switch')

    // Initially light mode (no dark class)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Click to enable dark mode
    act(() => {
      fireEvent.click(toggle)
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Click to disable dark mode
    act(() => {
      fireEvent.click(toggle)
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists preference to localStorage', () => {
    render(<DarkModeToggle />)

    const toggle = screen.getByRole('switch')

    // Toggle to dark mode
    act(() => {
      fireEvent.click(toggle)
    })
    expect(localStorage.setItem).toHaveBeenCalledWith('subcycle_theme', 'dark')

    // Toggle back to light mode
    act(() => {
      fireEvent.click(toggle)
    })
    expect(localStorage.setItem).toHaveBeenCalledWith('subcycle_theme', 'light')
  })
})
