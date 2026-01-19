'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Service {
  id: string
  name: string
  default_price: number
}

interface QuickAddServiceProps {
  services: Service[]
  onAdd: (serviceId: string, price: number) => void | Promise<void>
  onSkip: () => void
}

export function QuickAddService({
  services,
  onAdd,
  onSkip,
}: QuickAddServiceProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [price, setPrice] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setPrice(service.default_price.toString())
    }
  }

  const handleAdd = async () => {
    if (!selectedServiceId || !price) return

    setIsAdding(true)
    try {
      await onAdd(selectedServiceId, parseFloat(price))
    } finally {
      setIsAdding(false)
    }
  }

  const isValid = selectedServiceId && price && parseFloat(price) > 0

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="service-select" className="block text-sm font-medium text-gray-700">
        Streaming Service
      </label>
        <select
          id="service-select"
          value={selectedServiceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price-input" className="block text-sm font-medium text-gray-700">
          Monthly Price ($)
        </label>
        <Input
          id="price-input"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="9.99"
          className="mt-1"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!isValid || isAdding}
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
