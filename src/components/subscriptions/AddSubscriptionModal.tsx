'use client'

import { useState } from 'react'
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

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
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
            <select
              id="service-select"
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
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
