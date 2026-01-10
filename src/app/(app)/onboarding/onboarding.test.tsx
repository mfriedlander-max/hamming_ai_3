import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client for ServiceSelector
const mockServices = [
  { id: '1', name: 'Netflix', slug: 'netflix', default_price: 15.99, logo_url: null },
  { id: '2', name: 'Hulu', slug: 'hulu', default_price: 9.99, logo_url: null },
]

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: mockServices, error: null }),
      }),
    }),
  }),
}))

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders step 1 (WelcomeStep) initially', () => {
    render(<OnboardingPage />)

    expect(screen.getByText(/welcome to subcycle/i)).toBeInTheDocument()
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
  })

  it('advances to step 2 when Get Started is clicked', async () => {
    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('button', { name: /get started/i }))

    await waitFor(() => {
      expect(screen.getByText(/select your services/i)).toBeInTheDocument()
      expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument()
    })
  })

  it('can go back to step 1 from step 2', async () => {
    render(<OnboardingPage />)

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))

    await waitFor(() => {
      expect(screen.getByText(/select your services/i)).toBeInTheDocument()
    })

    // Go back to step 1
    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    expect(screen.getByText(/welcome to subcycle/i)).toBeInTheDocument()
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
  })

  it('shows progress indicator with correct step highlighted', async () => {
    render(<OnboardingPage />)

    // Step 1 - first dot should be highlighted
    const dots = screen.getAllByRole('generic').filter(
      (el) => el.className.includes('rounded-full') && el.className.includes('w-3')
    )

    // There should be 3 progress dots
    expect(dots).toHaveLength(3)
  })

  it('advances to step 3 from step 2 when services selected and Continue clicked', async () => {
    render(<OnboardingPage />)

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    // Select Netflix
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Click Continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText(/tell us your taste/i)).toBeInTheDocument()
      expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument()
    })
  })

  it('shows Complete button on step 3', async () => {
    render(<OnboardingPage />)

    // Navigate to step 3
    fireEvent.click(screen.getByRole('button', { name: /get started/i }))

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument()
    })
  })
})
