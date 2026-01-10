import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecommendationBadge } from './RecommendationBadge'

describe('RecommendationBadge', () => {
  describe('verdict: keep', () => {
    it('renders green badge with "Keep" text', () => {
      render(<RecommendationBadge verdict="keep" />)

      const badge = screen.getByText('Keep')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-800')
    })
  })

  describe('verdict: pause', () => {
    it('renders amber badge with "Pause" text', () => {
      render(<RecommendationBadge verdict="pause" />)

      const badge = screen.getByText('Pause')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-amber-100')
      expect(badge).toHaveClass('text-amber-800')
    })
  })

  describe('verdict: consider', () => {
    it('renders gray badge with "Consider" text', () => {
      render(<RecommendationBadge verdict="consider" />)

      const badge = screen.getByText('Consider')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-gray-100')
      expect(badge).toHaveClass('text-gray-800')
    })
  })

  it('applies custom className when provided', () => {
    render(<RecommendationBadge verdict="keep" className="custom-class" />)

    const badge = screen.getByText('Keep')
    expect(badge).toHaveClass('custom-class')
  })

  it('uses compact size by default', () => {
    render(<RecommendationBadge verdict="keep" />)

    const badge = screen.getByText('Keep')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('px-2')
    expect(badge).toHaveClass('py-0.5')
  })

  it('supports large size variant', () => {
    render(<RecommendationBadge verdict="keep" size="lg" />)

    const badge = screen.getByText('Keep')
    expect(badge).toHaveClass('text-sm')
    expect(badge).toHaveClass('px-3')
    expect(badge).toHaveClass('py-1')
  })
})
