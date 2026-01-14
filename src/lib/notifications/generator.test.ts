import { describe, it, expect } from 'vitest'
import {
  createContentReleaseNotification,
  createResubscribeNotification,
  createPauseSuggestionNotification,
  createPriceChangeNotification,
  formatRelativeTime,
} from './generator'

describe('createContentReleaseNotification', () => {
  it('should create a content release notification with correct fields', () => {
    const result = createContentReleaseNotification(
      'user-123',
      'Stranger Things S5',
      'Netflix',
      '2026-03-15'
    )

    expect(result.user_id).toBe('user-123')
    expect(result.type).toBe('content_release')
    expect(result.title).toContain('Stranger Things S5')
    expect(result.title).toContain('Netflix')
    expect(result.body).toContain('Mar 15')
    expect(result.data).toEqual({
      content_title: 'Stranger Things S5',
      service_name: 'Netflix',
      release_date: '2026-03-15',
    })
  })

  it('should format the release date correctly', () => {
    const result = createContentReleaseNotification(
      'user-123',
      'The Bear S4',
      'Hulu',
      '2026-12-01'
    )

    expect(result.body).toContain('Dec 1')
  })
})

describe('createResubscribeNotification', () => {
  it('should create a resubscribe notification with resume date', () => {
    const result = createResubscribeNotification(
      'user-123',
      'Netflix',
      'sub-456',
      '2026-04-01'
    )

    expect(result.user_id).toBe('user-123')
    expect(result.type).toBe('resubscribe_reminder')
    expect(result.title).toBe('Reminder Set')
    expect(result.body).toContain('Netflix')
    expect(result.body).toContain('Apr 1')
    expect(result.data).toEqual({
      subscription_id: 'sub-456',
      service_name: 'Netflix',
      resume_date: '2026-04-01',
    })
  })

  it('should create a resubscribe notification without resume date', () => {
    const result = createResubscribeNotification(
      'user-123',
      'HBO Max',
      'sub-789'
    )

    expect(result.type).toBe('resubscribe_reminder')
    expect(result.body).toContain('HBO Max')
    expect(result.body).not.toContain('on')
    expect(result.data?.resume_date).toBeUndefined()
  })
})

describe('createPauseSuggestionNotification', () => {
  it('should create a pause suggestion notification', () => {
    const result = createPauseSuggestionNotification(
      'user-123',
      'Disney+',
      'No matching content in the next 3 months'
    )

    expect(result.user_id).toBe('user-123')
    expect(result.type).toBe('pause_suggestion')
    expect(result.title).toContain('Disney+')
    expect(result.body).toBe('No matching content in the next 3 months')
    expect(result.data).toEqual({
      service_name: 'Disney+',
      reason: 'No matching content in the next 3 months',
    })
  })
})

describe('createPriceChangeNotification', () => {
  it('should create a price increase notification', () => {
    const result = createPriceChangeNotification(
      'user-123',
      'Netflix',
      15.99,
      17.99
    )

    expect(result.user_id).toBe('user-123')
    expect(result.type).toBe('price_change')
    expect(result.title).toContain('Netflix')
    expect(result.title).toContain('Price')
    expect(result.body).toContain('$15.99')
    expect(result.body).toContain('$17.99')
    expect(result.data).toEqual({
      service_name: 'Netflix',
      old_price: 15.99,
      new_price: 17.99,
    })
  })

  it('should create a price decrease notification', () => {
    const result = createPriceChangeNotification(
      'user-123',
      'Hulu',
      14.99,
      9.99
    )

    expect(result.body).toContain('$14.99')
    expect(result.body).toContain('$9.99')
  })
})

describe('formatRelativeTime', () => {
  it('should format time just now', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('Just now')
  })

  it('should format time in minutes', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinutesAgo.toISOString())).toBe('5 minutes ago')
  })

  it('should format time in hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2 hours ago')
  })

  it('should format time in days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3 days ago')
  })

  it('should format singular units correctly', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000)
    expect(formatRelativeTime(oneMinuteAgo.toISOString())).toBe('1 minute ago')

    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000)
    expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1 hour ago')

    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(oneDayAgo.toISOString())).toBe('1 day ago')
  })
})
