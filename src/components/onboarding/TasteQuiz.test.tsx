import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TasteQuiz } from './TasteQuiz'

describe('TasteQuiz', () => {
  const defaultProps = {
    onComplete: vi.fn(),
    onBack: vi.fn(),
    favoriteShows: '',
    onFavoriteShowsChange: vi.fn(),
    selectedGenres: [] as string[],
    onGenresChange: vi.fn(),
    isSubmitting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders favorite shows input', () => {
    render(<TasteQuiz {...defaultProps} />)

    expect(screen.getByLabelText(/favorite shows/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/breaking bad/i)).toBeInTheDocument()
  })

  it('renders genre checkboxes', () => {
    render(<TasteQuiz {...defaultProps} />)

    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary', 'Romance', 'Thriller']
    genres.forEach((genre) => {
      expect(screen.getByRole('checkbox', { name: genre })).toBeInTheDocument()
    })
  })

  it('calls onFavoriteShowsChange when shows input changes', () => {
    const onFavoriteShowsChange = vi.fn()
    render(<TasteQuiz {...defaultProps} onFavoriteShowsChange={onFavoriteShowsChange} />)

    const input = screen.getByLabelText(/favorite shows/i)
    fireEvent.change(input, { target: { value: 'Breaking Bad, The Office' } })

    expect(onFavoriteShowsChange).toHaveBeenCalledWith('Breaking Bad, The Office')
  })

  it('calls onGenresChange when genre checkbox is clicked', () => {
    const onGenresChange = vi.fn()
    render(<TasteQuiz {...defaultProps} onGenresChange={onGenresChange} />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Action' }))
    expect(onGenresChange).toHaveBeenCalledWith(['Action'])
  })

  it('removes genre when already selected and clicked', () => {
    const onGenresChange = vi.fn()
    render(
      <TasteQuiz
        {...defaultProps}
        selectedGenres={['Action', 'Comedy']}
        onGenresChange={onGenresChange}
      />
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Action' }))
    expect(onGenresChange).toHaveBeenCalledWith(['Comedy'])
  })

  it('renders Complete button', () => {
    render(<TasteQuiz {...defaultProps} />)

    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument()
  })

  it('calls onComplete when Complete button is clicked', () => {
    const onComplete = vi.fn()
    render(<TasteQuiz {...defaultProps} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /complete/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('disables Complete button when isSubmitting is true', () => {
    render(<TasteQuiz {...defaultProps} isSubmitting={true} />)

    expect(screen.getByRole('button', { name: /completing/i })).toBeDisabled()
  })

  it('renders Back button', () => {
    render(<TasteQuiz {...defaultProps} />)

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('calls onBack when Back button is clicked', () => {
    const onBack = vi.fn()
    render(<TasteQuiz {...defaultProps} onBack={onBack} />)

    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows checked state for selected genres', () => {
    render(<TasteQuiz {...defaultProps} selectedGenres={['Drama', 'Thriller']} />)

    expect(screen.getByRole('checkbox', { name: 'Drama' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Thriller' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Action' })).not.toBeChecked()
  })

  it('shows favorite shows value from props', () => {
    render(<TasteQuiz {...defaultProps} favoriteShows="The Wire, Sopranos" />)

    expect(screen.getByDisplayValue('The Wire, Sopranos')).toBeInTheDocument()
  })
})
