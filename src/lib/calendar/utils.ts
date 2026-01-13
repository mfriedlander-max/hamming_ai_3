import type { ContentRelease, ServiceReleases } from './types'

/**
 * Generate an array of month strings for a date range
 * @param startDate - The starting date
 * @param months - Number of months to generate (default: 6)
 * @returns Array of month strings in "YYYY-MM" format
 */
export function getMonthRange(startDate: Date, months: number = 6): string[] {
  const result: string[] = []

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    result.push(`${year}-${month}`)
  }

  return result
}

/**
 * Group content releases by their associated services
 * @param releases - Array of content releases
 * @param services - Array of services with id and name
 * @param contentServiceMap - Map of content ID to array of service IDs
 * @returns Array of ServiceReleases
 */
export function groupReleasesByService(
  releases: ContentRelease[],
  services: { service_id: string; service_name: string }[],
  contentServiceMap: Map<string, string[]>
): ServiceReleases[] {
  return services.map((service) => {
    const serviceReleases = releases.filter((release) => {
      const serviceIds = contentServiceMap.get(release.id)
      return serviceIds?.includes(service.service_id)
    })

    return {
      service_id: service.service_id,
      service_name: service.service_name,
      releases: serviceReleases,
    }
  })
}

/**
 * Calculate the horizontal position of a date within a month (0 to 1)
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param monthString - Month string (YYYY-MM)
 * @returns Position from 0 (start of month) to 1 (end of month)
 */
export function getPositionInMonth(
  dateString: string,
  monthString: string
): number {
  // Parse date string directly to avoid timezone issues
  const [, , dayStr] = dateString.split('-')
  const dayOfMonth = parseInt(dayStr, 10)

  const [year, month] = monthString.split('-').map(Number)

  // Get the number of days in this month
  const daysInMonth = new Date(year, month, 0).getDate()

  // Calculate position: (day - 1) / (totalDays - 1) to get 0 for first day, 1 for last day
  return (dayOfMonth - 1) / (daysInMonth - 1)
}

/**
 * Format a month string for display
 * @param monthString - Month string (YYYY-MM)
 * @returns Formatted string like "January 2026"
 */
export function formatMonthDisplay(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number)
  const date = new Date(year, month - 1, 1)

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Parse a month string to a Date object (first day of the month)
 * @param monthString - Month string (YYYY-MM)
 * @returns Date object set to the first day of the month
 */
export function parseMonthString(monthString: string): Date {
  const [year, month] = monthString.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/**
 * Get the current month string
 * @returns Current month in "YYYY-MM" format
 */
export function getCurrentMonthString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Navigate to previous month
 * @param monthString - Current month string (YYYY-MM)
 * @returns Previous month string
 */
export function getPreviousMonth(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Navigate to next month
 * @param monthString - Current month string (YYYY-MM)
 * @returns Next month string
 */
export function getNextMonth(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number)
  const date = new Date(year, month, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
