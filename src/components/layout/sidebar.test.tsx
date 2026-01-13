import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './sidebar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}))

describe('Sidebar', () => {
  it('renders SubCycle branding', () => {
    render(<Sidebar />)

    // SubCycle appears in both mobile header and desktop sidebar
    expect(screen.getAllByText('SubCycle').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/smart subscription manager/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /reminders/i })).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<Sidebar />)

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('links to correct routes', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /reminders/i })).toHaveAttribute('href', '/reminders')
  })

  it('renders Settings link', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
  })

  it('renders Calendar link', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /content calendar/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /content calendar/i })).toHaveAttribute('href', '/calendar')
  })

  it('renders Optimizer link', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /optimizer/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /optimizer/i })).toHaveAttribute('href', '/optimizer')
  })
})
