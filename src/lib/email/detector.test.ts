import { describe, it, expect } from 'vitest'
import { detectSubscriptions, filterExistingSubscriptions } from './detector'
import type { DetectedSubscription } from './types'

describe('detectSubscriptions', () => {
  it('returns mock detections when in mock mode', () => {
    const result = detectSubscriptions()

    expect(result.length).toBeGreaterThan(0)
    // Should detect known mock services
    const slugs = result.map((r) => r.service_slug)
    expect(slugs).toContain('netflix')
    expect(slugs).toContain('hulu')
  })

  it('returns unique services (no duplicates)', () => {
    const result = detectSubscriptions()

    const slugs = result.map((r) => r.service_slug)
    const uniqueSlugs = [...new Set(slugs)]

    expect(slugs.length).toBe(uniqueSlugs.length)
  })

  it('returns DetectedSubscription objects with required fields', () => {
    const result = detectSubscriptions()

    for (const subscription of result) {
      expect(subscription).toHaveProperty('service_slug')
      expect(subscription).toHaveProperty('service_name')
      expect(subscription).toHaveProperty('confidence')
      expect(subscription).toHaveProperty('detected_from')
      expect(['high', 'medium', 'low']).toContain(subscription.confidence)
    }
  })
})

describe('filterExistingSubscriptions', () => {
  const detectedServices: DetectedSubscription[] = [
    {
      service_slug: 'netflix',
      service_name: 'Netflix',
      confidence: 'high',
      detected_from: 'info@netflix.com',
    },
    {
      service_slug: 'hulu',
      service_name: 'Hulu',
      confidence: 'high',
      detected_from: 'no-reply@hulu.com',
    },
    {
      service_slug: 'disney-plus',
      service_name: 'Disney+',
      confidence: 'high',
      detected_from: 'disney@disneyplus.com',
    },
  ]

  it('filters out already subscribed services', () => {
    const existingSlugs = ['netflix']

    const result = filterExistingSubscriptions(detectedServices, existingSlugs)

    expect(result).toHaveLength(2)
    expect(result.map((r) => r.service_slug)).not.toContain('netflix')
    expect(result.map((r) => r.service_slug)).toContain('hulu')
    expect(result.map((r) => r.service_slug)).toContain('disney-plus')
  })

  it('returns all services when no existing subscriptions', () => {
    const existingSlugs: string[] = []

    const result = filterExistingSubscriptions(detectedServices, existingSlugs)

    expect(result).toHaveLength(3)
  })

  it('returns empty array when all detected are already subscribed', () => {
    const existingSlugs = ['netflix', 'hulu', 'disney-plus']

    const result = filterExistingSubscriptions(detectedServices, existingSlugs)

    expect(result).toHaveLength(0)
  })

  it('handles case-insensitive slug matching', () => {
    const existingSlugs = ['NETFLIX', 'Hulu']

    const result = filterExistingSubscriptions(detectedServices, existingSlugs)

    expect(result).toHaveLength(1)
    expect(result[0].service_slug).toBe('disney-plus')
  })
})
