// Gmail client with mock mode for development

interface EmailMessage {
  sender: string
  subject: string
}

/**
 * Check if real Gmail OAuth is configured
 */
export function isRealGmailConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

/**
 * Mock emails for development/testing
 * These simulate emails from streaming services
 */
export function getMockEmails(): EmailMessage[] {
  return [
    { sender: 'info@netflix.com', subject: 'Your Netflix Bill' },
    { sender: 'no-reply@hulu.com', subject: 'Hulu Monthly Statement' },
    {
      sender: 'disneyplus@email.disneyplus.com',
      subject: 'Welcome to Disney+',
    },
    { sender: 'noreply@mail.hbomax.com', subject: 'HBO Max Receipt' },
    {
      sender: 'digital-no-reply@amazon.com',
      subject: 'Your Prime Video subscription',
    },
  ]
}

// Mock service slugs that will be detected
export const MOCK_DETECTED_SERVICES = [
  'netflix',
  'hulu',
  'disney-plus',
  'hbo-max',
  'amazon-prime',
]

/**
 * Gmail API client wrapper
 * Uses mock mode when no real credentials are configured
 */
export class GmailClient {
  private accessToken: string | null

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  /**
   * Check if running in mock mode
   */
  isMockMode(): boolean {
    return !this.accessToken || !isRealGmailConfigured()
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Fetch emails from Gmail (or return mock data)
   */
  fetchEmails(): EmailMessage[] {
    if (this.isMockMode()) {
      return getMockEmails()
    }

    // Real Gmail API implementation would go here
    // For now, always return mock data since OAuth is a deployment concern
    return getMockEmails()
  }
}
