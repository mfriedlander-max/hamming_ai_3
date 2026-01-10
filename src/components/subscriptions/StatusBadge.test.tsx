import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders green badge with "Active" text when status is active', () => {
    render(<StatusBadge status="active" />)

    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })

  it('renders gray badge with "Paused" text when status is paused', () => {
    render(<StatusBadge status="paused" />)

    const badge = screen.getByText('Paused')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-gray-100')
    expect(badge).toHaveClass('text-gray-800')
  })

  it('applies custom className when provided', () => {
    render(<StatusBadge status="active" className="custom-class" />)

    const badge = screen.getByText('Active')
    expect(badge).toHaveClass('custom-class')
  })
})
