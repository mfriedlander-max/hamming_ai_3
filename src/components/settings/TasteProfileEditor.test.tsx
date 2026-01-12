import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TasteProfileEditor } from './TasteProfileEditor'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('TasteProfileEditor', () => {
  const defaultProps = {
    initialGenres: ['Action', 'Drama'],
    initialFavoriteShows: ['Breaking Bad', 'The Office'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  it('renders genre checkboxes with initial selection', () => {
    render(<TasteProfileEditor {...defaultProps} />)

    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary', 'Romance', 'Thriller']
    genres.forEach((genre) => {
      expect(screen.getByRole('checkbox', { name: genre })).toBeInTheDocument()
    })

    expect(screen.getByRole('checkbox', { name: 'Action' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Drama' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Comedy' })).not.toBeChecked()
  })

  it('renders favorite shows input with initial value', () => {
    render(<TasteProfileEditor {...defaultProps} />)

    expect(screen.getByDisplayValue('Breaking Bad, The Office')).toBeInTheDocument()
  })

  it('toggles genre selection when clicked', () => {
    render(<TasteProfileEditor {...defaultProps} />)

    const comedyCheckbox = screen.getByRole('checkbox', { name: 'Comedy' })
    expect(comedyCheckbox).not.toBeChecked()

    fireEvent.click(comedyCheckbox)
    expect(comedyCheckbox).toBeChecked()

    fireEvent.click(comedyCheckbox)
    expect(comedyCheckbox).not.toBeChecked()
  })

  it('updates favorite shows input', () => {
    render(<TasteProfileEditor {...defaultProps} />)

    const input = screen.getByLabelText(/favorite shows/i)
    fireEvent.change(input, { target: { value: 'The Wire, Sopranos' } })

    expect(screen.getByDisplayValue('The Wire, Sopranos')).toBeInTheDocument()
  })

  it('shows Save button', () => {
    render(<TasteProfileEditor {...defaultProps} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls API when Save button is clicked', async () => {
    render(<TasteProfileEditor {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/taste-profile', expect.objectContaining({
        method: 'PATCH',
      }))
    })
  })

  it('shows "Saving..." while submitting', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<TasteProfileEditor {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })
  })

  it('shows success toast after save', async () => {
    render(<TasteProfileEditor {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument()
    })
  })

  it('shows error message when save fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to update' }),
    })

    render(<TasteProfileEditor {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument()
    })
  })
})
