// Types for email-based subscription detection

export interface ConnectedEmail {
  id: string
  email: string
  provider: 'gmail'
  created_at: string
}

export interface DetectedSubscription {
  service_slug: string
  service_name: string
  confidence: 'high' | 'medium' | 'low'
  detected_from: string // e.g., "netflix@netflix.com"
}

export interface EmailScanResult {
  email_id: string
  detected: DetectedSubscription[]
  scanned_at: string
}

// Service email patterns for detection
export interface ServiceEmailPattern {
  slug: string
  name: string
  senderPatterns: RegExp[]
  subjectPatterns?: RegExp[]
}
