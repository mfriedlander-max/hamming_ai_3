import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/calendar',
}))

describe('BottomNav', () => {
  it('renders nav items with active state for current route', () => {
    render(<BottomNav />)

    // All nav items should be present
    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Calendar')).toBeInTheDocument()
    expect(screen.getByLabelText('Friends')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()

    // Calendar should be active (matches pathname /calendar)
    const calendarLink = screen.getByLabelText('Calendar')
    expect(calendarLink).toHaveAttribute('aria-current', 'page')

    // Dashboard should not be active
    const dashboardLink = screen.getByLabelText('Dashboard')
    expect(dashboardLink).not.toHaveAttribute('aria-current', 'page')
  })
})
