'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ConnectedEmail } from '@/lib/email/types'

interface EmailAccountsManagerProps {
  connectedEmails: ConnectedEmail[]
  onEmailsChange?: () => void
}

export function EmailAccountsManager({
  connectedEmails,
  onEmailsChange,
}: EmailAccountsManagerProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError('Failed to connect email')
        return
      }

      if (data.success) {
        onEmailsChange?.()
      }
    } catch {
      setError('Failed to connect email')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (emailId: string) => {
    setIsDisconnecting(emailId)
    setError(null)

    try {
      const response = await fetch('/api/auth/gmail', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      })

      if (!response.ok) {
        setError('Failed to disconnect email')
        return
      }

      onEmailsChange?.()
    } catch {
      setError('Failed to disconnect email')
    } finally {
      setIsDisconnecting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Connect your email to automatically detect streaming subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {connectedEmails.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              No email accounts connected yet.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Gmail'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{email.email}</p>
                    <p className="text-sm text-gray-500">Gmail</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(email.id)}
                  disabled={isDisconnecting === email.id}
                >
                  {isDisconnecting === email.id ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            ))}

            <Button onClick={handleConnect} disabled={isConnecting} variant="outline" className="w-full">
              {isConnecting ? 'Connecting...' : 'Connect Another Account'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
