import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InlineTastePicker } from './InlineTastePicker'
import { GENRES } from '@/lib/constants'

describe('InlineTastePicker', () => {
  const defaultProps = {
    onComplete: vi.fn(),
    onSkip: vi.fn(),
  }

  it('renders genre chips from GENRES constant', () => {
    render(<InlineTastePicker {...defaultProps} />)

    GENRES.forEach((genre) => {
      expect(screen.getByRole('button', { name: genre })).toBeInTheDocument()
    })
  })

  it('allows multi-select toggle on/off', () => {
    render(<InlineTastePicker {...defaultProps} />)

    const actionButton = screen.getByRole('button', { name: 'Action' })
    const comedyButton = screen.getByRole('button', { name: 'Comedy' })

    // Select Action
    fireEvent.click(actionButton)
    expect(actionButton).toHaveClass('bg-primary')

    // Select Comedy
    fireEvent.click(comedyButton)
    expect(comedyButton).toHaveClass('bg-primary')

    // Deselect Action
    fireEvent.click(actionButton)
    expect(actionButton).not.toHaveClass('bg-primary')
  })

  it('calls onComplete with selected genres', async () => {
    const onComplete = vi.fn()
    render(<InlineTastePicker {...defaultProps} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    fireEvent.click(screen.getByRole('button', { name: 'Drama' }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(['Action', 'Drama'])
    })
  })

  it('shows loading state during save', async () => {
    const onComplete = vi.fn((): Promise<void> => new Promise((r) => setTimeout(r, 100)))
    render(<InlineTastePicker {...defaultProps} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Action' }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('calls onSkip when skip button clicked', () => {
    const onSkip = vi.fn()
    render(<InlineTastePicker {...defaultProps} onSkip={onSkip} />)

    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(onSkip).toHaveBeenCalled()
  })

  it('disables save button when no genres selected', () => {
    render(<InlineTastePicker {...defaultProps} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
