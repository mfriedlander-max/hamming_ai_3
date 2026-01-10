import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignupPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn(),
    },
  }),
}))

describe('SignupPage', () => {
  it('renders signup form with email, password, and confirm password fields', () => {
    render(<SignupPage />)

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    render(<SignupPage />)

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('displays appropriate branding', () => {
    render(<SignupPage />)

    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByText(/subscription/i)).toBeInTheDocument()
  })
})
