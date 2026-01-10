import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a skeleton element', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toBeInTheDocument()
  })

  it('applies animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('applies rounded-md class', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('rounded-md')
  })

  it('applies bg-muted class', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('bg-muted')
  })

  it('accepts custom className prop', () => {
    const { container } = render(<Skeleton className="h-12 w-12" />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('h-12')
    expect(skeleton).toHaveClass('w-12')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('merges custom className with default classes', () => {
    const { container } = render(
      <Skeleton className="rounded-lg" />
    )
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('animate-pulse')
    expect(skeleton).toHaveClass('rounded-lg')
  })

  it('accepts HTML div attributes', () => {
    const { container } = render(
      <Skeleton data-testid="custom-skeleton" aria-label="Loading" />
    )
    const skeleton = container.querySelector('[data-testid="custom-skeleton"]')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders as a div element', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('div')
    expect(skeleton?.tagName).toBe('DIV')
  })

  it('supports custom height and width', () => {
    const { container } = render(<Skeleton className="h-20 w-full" />)
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('h-20')
    expect(skeleton).toHaveClass('w-full')
  })

  it('can be used for card skeleton with proper sizing', () => {
    const { container } = render(
      <Skeleton className="h-48 w-full rounded-lg" />
    )
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('h-48')
    expect(skeleton).toHaveClass('w-full')
    expect(skeleton).toHaveClass('rounded-lg')
  })

  it('can be used for text skeleton with proper sizing', () => {
    const { container } = render(
      <Skeleton className="h-4 w-3/4" />
    )
    const skeleton = container.querySelector('div')
    expect(skeleton).toHaveClass('h-4')
    expect(skeleton).toHaveClass('w-3/4')
  })
})
