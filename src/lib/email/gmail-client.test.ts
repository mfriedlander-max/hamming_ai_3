import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isRealGmailConfigured,
  getMockEmails,
  GmailClient,
} from './gmail-client'

describe('isRealGmailConfigured', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns false when no Google credentials are set', () => {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET

    expect(isRealGmailConfigured()).toBe(false)
  })

  it('returns false when only client ID is set', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-id'
    delete process.env.GOOGLE_CLIENT_SECRET

    expect(isRealGmailConfigured()).toBe(false)
  })

  it('returns true when both credentials are set', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-secret'

    expect(isRealGmailConfigured()).toBe(true)
  })
})

describe('getMockEmails', () => {
  it('returns mock emails for known streaming services', () => {
    const emails = getMockEmails()

    expect(emails.length).toBeGreaterThan(0)

    // Should include emails from known services
    const senders = emails.map((e) => e.sender)
    expect(senders.some((s) => s.includes('netflix'))).toBe(true)
    expect(senders.some((s) => s.includes('hulu'))).toBe(true)
    expect(senders.some((s) => s.includes('disney'))).toBe(true)
  })

  it('returns emails with sender and subject', () => {
    const emails = getMockEmails()

    for (const email of emails) {
      expect(email).toHaveProperty('sender')
      expect(email).toHaveProperty('subject')
      expect(typeof email.sender).toBe('string')
      expect(typeof email.subject).toBe('string')
    }
  })
})

describe('GmailClient', () => {
  describe('in mock mode', () => {
    it('creates client without access token in mock mode', () => {
      const client = new GmailClient()
      expect(client).toBeInstanceOf(GmailClient)
    })

    it('fetchEmails returns mock emails when no real credentials', () => {
      const client = new GmailClient()
      const emails = client.fetchEmails()

      expect(emails.length).toBeGreaterThan(0)
    })

    it('isMockMode returns true when no credentials', () => {
      const client = new GmailClient()
      expect(client.isMockMode()).toBe(true)
    })
  })

  describe('with access token', () => {
    it('creates client with access token', () => {
      const client = new GmailClient('test-access-token')
      expect(client).toBeInstanceOf(GmailClient)
    })

    it('stores the access token', () => {
      const client = new GmailClient('my-token')
      expect(client.getAccessToken()).toBe('my-token')
    })
  })
})
