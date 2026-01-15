import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CancelSubscriptionModal } from './CancelSubscriptionModal'

describe('CancelSubscriptionModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  const mockSubscription = {
    id: 'sub-123',
    service: {
      name: 'Netflix',
      cancel_url: 'https://www.netflix.com/cancelplan',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.open
    vi.stubGlobal('open', vi.fn())
  })

  it('renders modal with service name in title', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/cancel netflix/i)).toBeInTheDocument()
  })

  it('shows warning about external site', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/open.*cancellation page.*new tab/i)).toBeInTheDocument()
  })

  it('has checkbox defaulted to checked', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('opens cancel URL in new tab when clicking "Go to Cancellation Page"', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    const goButton = screen.getByRole('button', { name: /go to cancellation page/i })
    fireEvent.click(goButton)

    expect(window.open).toHaveBeenCalledWith(
      'https://www.netflix.com/cancelplan',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('does not call onConfirm when checkbox is unchecked', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    // Uncheck the checkbox
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    // Click go button
    const goButton = screen.getByRole('button', { name: /go to cancellation page/i })
    fireEvent.click(goButton)

    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with subscription id when checkbox is checked', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    // Checkbox is checked by default
    const goButton = screen.getByRole('button', { name: /go to cancellation page/i })
    fireEvent.click(goButton)

    expect(mockOnConfirm).toHaveBeenCalledWith('sub-123', true)
  })

  it('closes modal when clicking "Keep Subscription"', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    const keepButton = screen.getByRole('button', { name: /keep subscription/i })
    fireEvent.click(keepButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('does not render content when subscription is null', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={null}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument()
  })

  it('shows fallback message when cancel_url is null', () => {
    const subscriptionWithoutUrl = {
      id: 'sub-456',
      service: {
        name: 'Custom Service',
        cancel_url: null,
      },
    }

    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={subscriptionWithoutUrl}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/no cancellation link available/i)).toBeInTheDocument()
  })

  it('closes modal after successful action', () => {
    render(
      <CancelSubscriptionModal
        open={true}
        onClose={mockOnClose}
        subscription={mockSubscription}
        onConfirm={mockOnConfirm}
      />
    )

    const goButton = screen.getByRole('button', { name: /go to cancellation page/i })
    fireEvent.click(goButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
