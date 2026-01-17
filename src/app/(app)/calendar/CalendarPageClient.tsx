'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContentCalendarPage } from '@/components/calendar-unified'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type {
  CalendarOptimizedPlan,
  ContentRelease,
} from '@/lib/optimizer-v2/types'

interface Service {
  id: string
  name: string
  base_price: number
}

export function CalendarPageClient() {
  const [plan, setPlan] = useState<CalendarOptimizedPlan | null>(null)
  const [releases, setReleases] = useState<ContentRelease[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubscriptions, setHasSubscriptions] = useState(true)
  const [hasTasteProfile, setHasTasteProfile] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Check if user has subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      setHasSubscriptions((subscriptions?.length ?? 0) > 0)

      // Check if user has taste profile
      const { data: tasteProfile } = await supabase
        .from('taste_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      setHasTasteProfile((tasteProfile?.length ?? 0) > 0)

      // Fetch services for empty state
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name, base_price')
        .order('name')

      setServices(servicesData ?? [])

      // Only fetch optimizer plan if user has subscriptions
      if ((subscriptions?.length ?? 0) > 0) {
        // Fetch optimizer plan
        const planResponse = await fetch('/api/optimizer-v2', {
          method: 'POST',
        })

        if (planResponse.ok) {
          const planData = await planResponse.json()
          setPlan(planData.plan)
        }

        // Fetch calendar releases
        const calendarResponse = await fetch('/api/calendar')
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json()
          // Flatten releases from all services
          const allReleases: ContentRelease[] = []
          for (const service of calendarData.services || []) {
            for (const release of service.releases || []) {
              allReleases.push({
                ...release,
                service_id: service.service_id,
                service_name: service.service_name,
              })
            }
          }
          setReleases(allReleases)
        }
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast({
        message: 'Failed to load calendar data',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApplyAll = async () => {
    try {
      const response = await fetch('/api/optimizer-v2/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        toast({ message: 'Plan applied successfully!', type: 'success' })
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to apply plan')
      }
    } catch {
      toast({
        message: 'Failed to apply plan',
        type: 'error',
      })
    }
  }

  const handleRegenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch {
      toast({
        message: 'Failed to regenerate plan',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromQueue = async (intentId: string) => {
    try {
      const response = await fetch('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_from_queue', intent_id: intentId }),
      })

      if (response.ok) {
        toast({ message: 'Removed from queue', type: 'success' })
        fetchData()
      }
    } catch {
      toast({
        message: 'Failed to remove from queue',
        type: 'error',
      })
    }
  }

  const handleAddToQueue = async (release: ContentRelease) => {
    try {
      const response = await fetch('/api/calendar/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_queue',
          release_id: release.id,
          title: release.title,
          service_id: release.service_id,
        }),
      })

      if (response.ok) {
        toast({ message: 'Added to queue', type: 'success' })
        fetchData()
      }
    } catch {
      toast({
        message: 'Failed to add to queue',
        type: 'error',
      })
    }
  }

  const handleGenreSelect = async (genres: string[]) => {
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('taste_profiles').upsert({
        user_id: user.id,
        genres,
        favorite_shows: [],
      })

      setHasTasteProfile(true)
      toast({ message: 'Genres saved!', type: 'success' })
    } catch {
      toast({
        message: 'Failed to save genres',
        type: 'error',
      })
    }
  }

  const handleServiceAdd = async (serviceId: string, price: number) => {
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('subscriptions').insert({
        user_id: user.id,
        service_id: serviceId,
        monthly_cost: price,
        status: 'active',
      })

      setHasSubscriptions(true)
      toast({ message: 'Subscription added!', type: 'success' })
      fetchData() // Refresh to get optimizer plan
    } catch {
      toast({
        message: 'Failed to add subscription',
        type: 'error',
      })
    }
  }

  return (
    <ContentCalendarPage
      plan={plan}
      releases={releases}
      isLoading={isLoading}
      onApplyAll={handleApplyAll}
      onRegenerate={handleRegenerate}
      onRemoveFromQueue={handleRemoveFromQueue}
      onAddToQueue={handleAddToQueue}
      hasSubscriptions={hasSubscriptions}
      hasTasteProfile={hasTasteProfile}
      services={services}
      onGenreSelect={handleGenreSelect}
      onServiceAdd={handleServiceAdd}
    />
  )
}
