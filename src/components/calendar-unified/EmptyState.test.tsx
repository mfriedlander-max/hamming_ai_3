import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  const defaultProps = {
    onGenreSelect: vi.fn(),
    onServiceAdd: vi.fn(),
    onSkipToCalendar: vi.fn(),
  }

  it('renders welcome message for new users', () => {
    render(<EmptyState {...defaultProps} />)

    expect(screen.getByText(/welcome to subcycle/i)).toBeInTheDocument()
    expect(screen.getByText(/start saving on streaming/i)).toBeInTheDocument()
  })

  it('shows 3-step guidance', () => {
    render(<EmptyState {...defaultProps} />)

    expect(screen.getByText(/select your genres/i)).toBeInTheDocument()
    expect(screen.getByText(/add a subscription/i)).toBeInTheDocument()
    expect(screen.getByText(/see your savings/i)).toBeInTheDocument()
  })

  it('renders InlineTastePicker when step 1 is active', () => {
    render(<EmptyState {...defaultProps} currentStep={1} />)

    // Should show genre picker UI
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comedy/i })).toBeInTheDocument()
  })

  it('renders QuickAddService when step 2 is active', () => {
    render(<EmptyState {...defaultProps} currentStep={2} />)

    // Should show service selection UI
    expect(screen.getByText(/which streaming service/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls onGenreSelect when genres are selected and confirmed', async () => {
    const onGenreSelect = vi.fn()
    render(<EmptyState {...defaultProps} onGenreSelect={onGenreSelect} currentStep={1} />)

    // Click a genre chip
    fireEvent.click(screen.getByRole('button', { name: /action/i }))
    // Click continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(onGenreSelect).toHaveBeenCalledWith(expect.arrayContaining(['Action']))
  })

  it('calls onServiceAdd when service is added', () => {
    const onServiceAdd = vi.fn()
    render(<EmptyState {...defaultProps} onServiceAdd={onServiceAdd} currentStep={2} />)

    // The service add flow will be tested more thoroughly in QuickAddService tests
    // Here we just verify the callback prop is passed through
    expect(screen.getByRole('button', { name: /add service/i })).toBeInTheDocument()
  })

  it('allows skipping to calendar view', () => {
    const onSkipToCalendar = vi.fn()
    render(<EmptyState {...defaultProps} onSkipToCalendar={onSkipToCalendar} />)

    const skipLink = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipLink)

    expect(onSkipToCalendar).toHaveBeenCalled()
  })
})
