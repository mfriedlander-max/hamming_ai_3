export interface TooltipConfig {
  id: string
  title: string
  content: string
  target: string // CSS selector or data attribute
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const CALENDAR_TOOLTIPS: Record<string, TooltipConfig> = {
  savings_section: {
    id: 'savings_section',
    title: 'Your Savings',
    content:
      'This shows how much you could save by optimizing when you subscribe and cancel services.',
    target: '[data-tooltip="savings"]',
    position: 'bottom',
  },
  watch_queue: {
    id: 'watch_queue',
    title: 'Watch Queue',
    content:
      'Content is prioritized by deadline and your preferences. Drag to reorder, or click to see details.',
    target: '[data-tooltip="queue"]',
    position: 'bottom',
  },
  calendar_view: {
    id: 'calendar_view',
    title: 'Calendar View',
    content:
      'See when to subscribe and cancel each service. Green bars show current subscriptions, blue shows planned.',
    target: '[data-tooltip="calendar"]',
    position: 'top',
  },
  upcoming_releases: {
    id: 'upcoming_releases',
    title: 'Upcoming Releases',
    content:
      'New content coming to your services. Click "Add to Queue" to include it in your schedule.',
    target: '[data-tooltip="releases"]',
    position: 'top',
  },
  apply_all: {
    id: 'apply_all',
    title: 'Apply All',
    content:
      'Creates reminders for all recommended subscribe and cancel dates. You can always adjust later.',
    target: '[data-tooltip="apply-all"]',
    position: 'bottom',
  },
}

const STORAGE_KEY = 'subcycle_seen_tooltips'

export function getSeenTooltips(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function markTooltipSeen(tooltipId: string): void {
  if (typeof window === 'undefined') return
  const seen = getSeenTooltips()
  if (!seen.includes(tooltipId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, tooltipId]))
  }
}

export function hasSeenTooltip(tooltipId: string): boolean {
  return getSeenTooltips().includes(tooltipId)
}

export function resetSeenTooltips(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
