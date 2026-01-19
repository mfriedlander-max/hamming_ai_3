'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TasteProfileEditor } from '@/components/settings/TasteProfileEditor'
import { EmailAccountsManager } from '@/components/settings/EmailAccountsManager'
import { SubscriptionDetector } from '@/components/settings/SubscriptionDetector'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { VacationMode } from '@/components/settings/VacationMode'
import { DarkModeToggle } from '@/components/settings/DarkModeToggle'
import type { ConnectedEmail } from '@/lib/email/types'

interface SettingsClientProps {
  initialGenres: string[]
  initialFavoriteShows: string[]
  initialConnectedEmails: ConnectedEmail[]
}

export function SettingsClient({
  initialGenres,
  initialFavoriteShows,
  initialConnectedEmails,
}: SettingsClientProps) {
  const router = useRouter()
  const [connectedEmails] = useState<ConnectedEmail[]>(initialConnectedEmails)

  const handleEmailsChange = () => {
    // Refresh to get updated emails from server
    router.refresh()
  }

  const handleSubscriptionsAdded = () => {
    // Refresh the page to update subscription list
    router.refresh()
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and connected accounts.
        </p>
      </div>

      <div className="max-w-2xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <TasteProfileEditor
              initialGenres={initialGenres}
              initialFavoriteShows={initialFavoriteShows}
            />
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Auto-Pilot</h3>
              <VacationMode />
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
              <DarkModeToggle />
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <EmailAccountsManager
              connectedEmails={connectedEmails}
              onEmailsChange={handleEmailsChange}
            />

            {connectedEmails.length > 0 && (
              <SubscriptionDetector
                emailId={connectedEmails[0].id}
                onSubscriptionsAdded={handleSubscriptionsAdded}
              />
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
