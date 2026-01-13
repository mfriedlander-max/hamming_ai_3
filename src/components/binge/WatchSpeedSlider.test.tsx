import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchSpeedSlider } from './WatchSpeedSlider'

describe('WatchSpeedSlider', () => {
  it('renders with current value', () => {
    render(<WatchSpeedSlider value={2} onChange={vi.fn()} />)

    expect(screen.getByText('2 episodes/day')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2')
  })

  it('shows label for casual speed (1)', () => {
    render(<WatchSpeedSlider value={1} onChange={vi.fn()} />)

    expect(screen.getByText('Casual')).toBeInTheDocument()
    expect(screen.getByText('1 episode/day')).toBeInTheDocument()
  })

  it('shows label for marathon speed (6)', () => {
    render(<WatchSpeedSlider value={6} onChange={vi.fn()} />)

    expect(screen.getByText('Marathon')).toBeInTheDocument()
    expect(screen.getByText('6 episodes/day')).toBeInTheDocument()
  })

  it('calls onChange when slider value changes', () => {
    const handleChange = vi.fn()
    render(<WatchSpeedSlider value={2} onChange={handleChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })

    expect(handleChange).toHaveBeenCalledWith(4)
  })
})
