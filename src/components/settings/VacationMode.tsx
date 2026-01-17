'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane, Calendar } from 'lucide-react'
import type { VacationStatus } from '@/lib/edge-cases/types'

export function VacationMode() {
  const [status, setStatus] = useState<VacationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [returnDate, setReturnDate] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/vacation-mode')
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
          if (data.return_date) {
            setReturnDate(data.return_date)
          }
        }
      } catch (error) {
        console.error('Failed to fetch vacation status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const handleToggle = async () => {
    if (!status) return

    const newValue = !status.is_on_vacation
    setSaving(true)

    try {
      const response = await fetch('/api/vacation-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newValue,
          return_date: newValue ? returnDate || null : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status ?? {
          is_on_vacation: newValue,
          start_date: newValue ? new Date().toISOString().split('T')[0] : null,
          return_date: newValue ? returnDate || null : null,
          days_remaining: null,
        })
        toast({
          message: newValue ? 'Vacation mode enabled' : 'Welcome back!',
          type: 'success',
        })
      } else {
        toast({ message: 'Failed to update vacation mode', type: 'error' })
      }
    } catch {
      toast({ message: 'Failed to update vacation mode', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleReturnDateChange = async () => {
    if (!status?.is_on_vacation || !returnDate) return

    setSaving(true)

    try {
      const response = await fetch('/api/vacation-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          return_date: returnDate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.status ?? { ...status, return_date: returnDate })
        toast({ message: 'Return date updated', type: 'success' })
      } else {
        toast({ message: 'Failed to update return date', type: 'error' })
      }
    } catch {
      toast({ message: 'Failed to update return date', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    )
  }

  if (!status) {
    return (
      <div className="text-center py-4 text-gray-500">
        Failed to load vacation status
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Plane className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Vacation Mode</p>
            <p className="text-xs text-gray-500">
              Pause all automatic actions while you&apos;re away
            </p>
          </div>
        </div>
        <Switch
          checked={status.is_on_vacation}
          onCheckedChange={handleToggle}
          disabled={saving}
        />
      </div>

      {status.is_on_vacation && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar className="h-4 w-4" />
            <p className="text-sm font-medium">Vacation Mode is On</p>
          </div>

          {status.days_remaining !== null && (
            <p className="text-sm text-blue-600">
              {status.days_remaining} days remaining
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="return-date" className="block text-xs text-gray-600">
              Return Date (optional)
            </label>
            <div className="flex gap-2">
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1"
              />
              {returnDate !== status.return_date && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReturnDateChange}
                  disabled={saving}
                >
                  Update
                </Button>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={saving}
            className="w-full"
          >
            I&apos;m Back!
          </Button>
        </div>
      )}
    </div>
  )
}
