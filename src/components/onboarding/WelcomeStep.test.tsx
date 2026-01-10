import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeStep } from './WelcomeStep'

describe('WelcomeStep', () => {
  it('renders SubCycle branding', () => {
    render(<WelcomeStep onNext={vi.fn()} />)

    expect(screen.getByText(/subcycle/i)).toBeInTheDocument()
    expect(screen.getByText(/manage your streaming subscriptions/i)).toBeInTheDocument()
  })

  it('renders Get Started button', () => {
    render(<WelcomeStep onNext={vi.fn()} />)

    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('calls onNext when Get Started button is clicked', () => {
    const onNext = vi.fn()
    render(<WelcomeStep onNext={onNext} />)

    fireEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('displays welcome message', () => {
    render(<WelcomeStep onNext={vi.fn()} />)

    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
  })
})
