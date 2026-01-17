import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FirstSavingsPopup } from './FirstSavingsPopup'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('FirstSavingsPopup', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('renders celebration message with savings amount', () => {
    render(
      <FirstSavingsPopup
        savingsAmount={156}
        isVisible={true}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText(/congratulations/i)).toBeInTheDocument()
    expect(screen.getByText(/\$156/)).toBeInTheDocument()
    expect(screen.getByText(/per year/i)).toBeInTheDocument()
  })

  it('closes on dismiss and stores flag', () => {
    const onDismiss = vi.fn()
    render(
      <FirstSavingsPopup
        savingsAmount={156}
        isVisible={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /awesome/i }))

    expect(onDismiss).toHaveBeenCalled()
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'subcycle_first_savings_celebrated',
      'true'
    )
  })

  it('does not render when not visible', () => {
    render(
      <FirstSavingsPopup
        savingsAmount={156}
        isVisible={false}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.queryByText(/congratulations/i)).not.toBeInTheDocument()
  })

  it('formats savings amount with dollar sign', () => {
    render(
      <FirstSavingsPopup
        savingsAmount={234.56}
        isVisible={true}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText(/\$235/)).toBeInTheDocument() // Rounded
  })
})
