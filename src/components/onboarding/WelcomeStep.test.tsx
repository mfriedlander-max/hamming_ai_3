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

  it('calls onNext with empty string when Get Started button is clicked without name', () => {
    const onNext = vi.fn()
    render(<WelcomeStep onNext={onNext} />)

    fireEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledWith('')
  })

  it('displays welcome message', () => {
    render(<WelcomeStep onNext={vi.fn()} />)

    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
  })

  it('renders name input field with label', () => {
    render(<WelcomeStep onNext={vi.fn()} />)

    expect(screen.getByLabelText(/what should we call you/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument()
  })

  it('calls onNext with entered name when Get Started button is clicked', () => {
    const onNext = vi.fn()
    render(<WelcomeStep onNext={onNext} />)

    const nameInput = screen.getByPlaceholderText(/your name/i)
    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))

    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledWith('John')
  })
})
