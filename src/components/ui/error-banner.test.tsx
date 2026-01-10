import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBanner } from './error-banner'

describe('ErrorBanner', () => {
  it('renders the error message', () => {
    render(<ErrorBanner message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('displays the message in red text', () => {
    render(<ErrorBanner message="Error occurred" />)
    const message = screen.getByText('Error occurred')
    expect(message).toHaveClass('text-red-700')
  })

  it('renders with red background styling', () => {
    const { container } = render(<ErrorBanner message="Test error" />)
    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('bg-red-50')
    expect(banner).toHaveClass('border-red-200')
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorBanner message="Error without retry" />)
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="Error with retry" onRetry={onRetry} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="Click to retry" onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders with proper layout (flex between message and button)', () => {
    const onRetry = vi.fn()
    const { container } = render(<ErrorBanner message="Test" onRetry={onRetry} />)
    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('flex')
    expect(banner).toHaveClass('items-center')
    expect(banner).toHaveClass('justify-between')
  })

  it('renders with rounded border', () => {
    const { container } = render(<ErrorBanner message="Test" />)
    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('rounded-lg')
  })

  it('renders with padding', () => {
    const { container } = render(<ErrorBanner message="Test" />)
    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('p-4')
  })

  it('renders with border', () => {
    const { container } = render(<ErrorBanner message="Test" />)
    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('border')
  })
})
