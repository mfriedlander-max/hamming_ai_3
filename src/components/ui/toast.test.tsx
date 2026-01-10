import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast, Toast } from './toast'

// Test component that uses the toast hook
function TestComponent() {
  const { toast, toasts } = useToast()

  return (
    <div>
      <button onClick={() => toast({ message: 'Test message' })}>
        Show Toast
      </button>
      <button onClick={() => toast({ message: 'Success!', type: 'success' })}>
        Show Success
      </button>
      <button onClick={() => toast({ message: 'Error!', type: 'error' })}>
        Show Error
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders toast message', () => {
    render(<Toast message="Hello world" onDismiss={() => {}} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('applies success styling for success type', () => {
    render(<Toast message="Success" type="success" onDismiss={() => {}} />)
    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-green-50')
  })

  it('applies error styling for error type', () => {
    render(<Toast message="Error" type="error" onDismiss={() => {}} />)
    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-red-50')
  })

  it('applies default styling for info type', () => {
    render(<Toast message="Info" type="info" onDismiss={() => {}} />)
    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-gray-50')
  })
})

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds toast to the list when toast() is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')

    await act(async () => {
      screen.getByText('Show Toast').click()
    })

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('auto-dismisses toast after timeout', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Show Toast').click()
    })

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    // Fast-forward time to trigger auto-dismiss
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })
})
