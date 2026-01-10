'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Service } from './types'

interface AddSubscriptionModalProps {
  services: Service[]
  onAdd: (data: { service_id: string; monthly_cost: number }) => void
  open: boolean
  onClose: () => void
}

export function AddSubscriptionModal({
  services,
  onAdd,
  open,
  onClose,
}: AddSubscriptionModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [logoError, setLogoError] = useState(false)

  const selectedService = services.find((s) => s.id === selectedServiceId)

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setLogoError(false) // Reset logo error when service changes
    // Update price when service is selected
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId)
      if (service) {
        setMonthlyPrice(service.default_price.toString())
      }
    } else {
      setMonthlyPrice('')
    }
  }

  const handleClose = () => {
    // Reset form when modal closes
    setSelectedServiceId('')
    setMonthlyPrice('')
    setLogoError(false)
    onClose()
  }

  const handleAdd = () => {
    if (!selectedServiceId) return

    onAdd({
      service_id: selectedServiceId,
      monthly_cost: parseFloat(monthlyPrice) || 0,
    })

    // Reset form after adding
    setSelectedServiceId('')
    setMonthlyPrice('')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Select a streaming service to add to your subscriptions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <div className="flex items-center gap-3">
              {selectedService && (
                logoError ? (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                    {selectedService.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <Image
                    src={`/logos/${selectedService.slug}.svg`}
                    alt={selectedService.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    onError={() => setLogoError(true)}
                  />
                )
              )}
              <select
                id="service-select"
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="monthly-cost" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Cost ($)
            </label>
            <Input
              id="monthly-cost"
              type="number"
              step="0.01"
              min="0"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedServiceId}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
