'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import type { NotificationPreferences as NotificationPreferencesType } from '@/lib/notifications/types'

interface PreferenceItem {
  key: keyof Omit<NotificationPreferencesType, 'user_id'>
  label: string
  description: string
}

const preferenceItems: PreferenceItem[] = [
  {
    key: 'content_release',
    label: 'Content Releases',
    description: 'Get notified when content you might like is releasing soon',
  },
  {
    key: 'pause_suggestion',
    label: 'Pause Suggestions',
    description: 'Receive suggestions to pause subscriptions with no upcoming content',
  },
  {
    key: 'resubscribe_reminder',
    label: 'Resubscribe Reminders',
    description: 'Get reminded when it\'s time to resubscribe to paused services',
  },
  {
    key: 'price_change',
    label: 'Price Changes',
    description: 'Be notified when subscription prices change',
  },
]

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesType | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences')
        if (response.ok) {
          const data = await response.json()
          setPreferences(data)
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const handleToggle = async (key: keyof Omit<NotificationPreferencesType, 'user_id'>) => {
    if (!preferences) return

    const newValue = !preferences[key]

    // Optimistic update
    setPreferences((prev) => (prev ? { ...prev, [key]: newValue } : prev))

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      })

      if (response.ok) {
        toast({ message: 'Preferences saved', type: 'success' })
      } else {
        // Revert on error
        setPreferences((prev) => (prev ? { ...prev, [key]: !newValue } : prev))
        toast({ message: 'Failed to save preferences', type: 'error' })
      }
    } catch {
      // Revert on error
      setPreferences((prev) => (prev ? { ...prev, [key]: !newValue } : prev))
      toast({ message: 'Failed to save preferences', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-accent rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load preferences
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Choose which notifications you want to receive
      </p>

      <div className="space-y-4">
        {preferenceItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 bg-muted rounded-lg"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={preferences[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
