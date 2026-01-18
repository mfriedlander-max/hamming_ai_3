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

    // Dashboard appears in both sidebar and BottomNav
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i })
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /reminders/i })).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<Sidebar />)

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('links to correct routes', () => {
    render(<Sidebar />)

    // Dashboard appears in both sidebar and BottomNav
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i })
    expect(dashboardLinks[0]).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /reminders/i })).toHaveAttribute('href', '/reminders')
  })

  it('renders Settings link', () => {
    render(<Sidebar />)

    // Settings appears in both sidebar and BottomNav
    const settingsLinks = screen.getAllByRole('link', { name: /settings/i })
    expect(settingsLinks.length).toBeGreaterThanOrEqual(1)
    expect(settingsLinks[0]).toHaveAttribute('href', '/settings')
  })

  it('renders Calendar link', () => {
    render(<Sidebar />)

    // Content Calendar in sidebar, Calendar in BottomNav
    const calendarLinks = screen.getAllByRole('link', { name: /calendar/i })
    expect(calendarLinks.length).toBeGreaterThanOrEqual(1)
    expect(calendarLinks[0]).toHaveAttribute('href', '/calendar')
  })

  it('renders Household link', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /household/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /household/i })).toHaveAttribute('href', '/household')
  })

  it('renders Friends link', () => {
    render(<Sidebar />)

    // Friends appears in both sidebar and BottomNav
    const friendsLinks = screen.getAllByRole('link', { name: /friends/i })
    expect(friendsLinks.length).toBeGreaterThanOrEqual(1)
    expect(friendsLinks[0]).toHaveAttribute('href', '/friends')
  })
})
