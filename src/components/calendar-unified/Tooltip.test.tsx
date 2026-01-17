import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders tooltip content', () => {
    render(
      <Tooltip
        id="test-tooltip"
        title="Test Title"
        content="Test content description"
        isVisible={true}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content description')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(
      <Tooltip
        id="test-tooltip"
        title="Test Title"
        content="Test content description"
        isVisible={false}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('dismisses on click', () => {
    const onDismiss = vi.fn()
    render(
      <Tooltip
        id="test-tooltip"
        title="Test Title"
        content="Test content description"
        isVisible={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /got it/i }))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('auto-dismisses after timeout', () => {
    const onDismiss = vi.fn()
    render(
      <Tooltip
        id="test-tooltip"
        title="Test Title"
        content="Test content description"
        isVisible={true}
        onDismiss={onDismiss}
        autoHideMs={5000}
      />
    )

    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onDismiss).toHaveBeenCalled()
  })

  it('clears timeout on unmount', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(
      <Tooltip
        id="test-tooltip"
        title="Test Title"
        content="Test content description"
        isVisible={true}
        onDismiss={onDismiss}
        autoHideMs={5000}
      />
    )

    unmount()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onDismiss).not.toHaveBeenCalled()
  })
})
