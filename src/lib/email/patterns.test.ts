import { describe, it, expect } from 'vitest'
import { SERVICE_EMAIL_PATTERNS, matchServiceFromEmail, matchServiceFromEmails } from './patterns'

describe('SERVICE_EMAIL_PATTERNS', () => {
  it('contains patterns for major streaming services', () => {
    const slugs = SERVICE_EMAIL_PATTERNS.map(p => p.slug)
    expect(slugs).toContain('netflix')
    expect(slugs).toContain('hulu')
    expect(slugs).toContain('disney-plus')
    expect(slugs).toContain('hbo-max')
    expect(slugs).toContain('amazon-prime')
  })
})

describe('matchServiceFromEmail', () => {
  it('matches Netflix emails', () => {
    const result = matchServiceFromEmail('info@netflix.com', 'Your Netflix Bill')
    expect(result?.slug).toBe('netflix')
    expect(result?.confidence).toBe('high')
  })

  it('matches Hulu emails', () => {
    const result = matchServiceFromEmail('no-reply@hulu.com', 'Hulu Subscription')
    expect(result?.slug).toBe('hulu')
  })

  it('matches Disney+ emails', () => {
    const result = matchServiceFromEmail('disneyplus@email.disneyplus.com', 'Welcome to Disney+')
    expect(result?.slug).toBe('disney-plus')
  })

  it('matches HBO Max emails', () => {
    const result = matchServiceFromEmail('noreply@mail.hbomax.com', 'Your HBO Max receipt')
    expect(result?.slug).toBe('hbo-max')
  })

  it('matches Amazon Prime Video emails', () => {
    const result = matchServiceFromEmail('digital-no-reply@amazon.com', 'Prime Video subscription')
    expect(result?.slug).toBe('amazon-prime')
  })

  it('returns null for non-streaming service emails', () => {
    const result = matchServiceFromEmail('hello@example.com', 'Regular newsletter')
    expect(result).toBeNull()
  })

  it('is case-insensitive for sender matching', () => {
    const result = matchServiceFromEmail('INFO@NETFLIX.COM', 'Your Bill')
    expect(result?.slug).toBe('netflix')
  })
})

describe('matchServiceFromEmails', () => {
  it('detects multiple services from email list', () => {
    const emails = [
      { sender: 'info@netflix.com', subject: 'Netflix bill' },
      { sender: 'no-reply@hulu.com', subject: 'Hulu subscription' },
      { sender: 'hello@example.com', subject: 'Newsletter' },
    ]

    const results = matchServiceFromEmails(emails)

    expect(results).toHaveLength(2)
    expect(results.map(r => r.service_slug)).toContain('netflix')
    expect(results.map(r => r.service_slug)).toContain('hulu')
  })

  it('deduplicates services (only one entry per service)', () => {
    const emails = [
      { sender: 'info@netflix.com', subject: 'Bill 1' },
      { sender: 'support@netflix.com', subject: 'Bill 2' },
      { sender: 'noreply@netflix.com', subject: 'Bill 3' },
    ]

    const results = matchServiceFromEmails(emails)

    expect(results).toHaveLength(1)
    expect(results[0].service_slug).toBe('netflix')
  })

  it('returns empty array for no matches', () => {
    const emails = [
      { sender: 'hello@example.com', subject: 'Newsletter' },
    ]

    const results = matchServiceFromEmails(emails)

    expect(results).toHaveLength(0)
  })
})
