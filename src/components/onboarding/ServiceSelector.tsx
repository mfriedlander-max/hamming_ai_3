'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Service {
  id: string
  name: string
  slug: string
  default_price: number
  logo_url: string | null
}

interface SelectedService {
  service_id: string
  monthly_cost: number
}

interface ServiceSelectorProps {
  onNext: () => void
  onBack: () => void
  selectedServices: SelectedService[]
  onServicesChange: (services: SelectedService[]) => void
}

export function ServiceSelector({
  onNext,
  onBack,
  selectedServices,
  onServicesChange,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('id, name, slug, default_price, logo_url')
        .order('name')

      if (!error && data) {
        setServices(data)
      }
      setLoading(false)
    }

    fetchServices()
  }, [])

  const isSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.service_id === serviceId)
  }

  const getServicePrice = (serviceId: string, defaultPrice: number) => {
    const service = selectedServices.find((s) => s.service_id === serviceId)
    return service?.monthly_cost ?? defaultPrice
  }

  const handleToggleService = (service: Service) => {
    if (isSelected(service.id)) {
      onServicesChange(selectedServices.filter((s) => s.service_id !== service.id))
    } else {
      onServicesChange([
        ...selectedServices,
        { service_id: service.id, monthly_cost: service.default_price },
      ])
    }
  }

  const handlePriceChange = (serviceId: string, price: number) => {
    onServicesChange(
      selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, monthly_cost: price } : s
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">Loading services...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Select Your Services</h2>
        <p className="text-gray-600 mt-2">
          Choose the streaming services you subscribe to and enter your monthly cost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              isSelected(service.id)
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-gray-300'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected(service.id)}
                  onChange={() => handleToggleService(service)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="text-sm">
                    Default: ${service.default_price.toFixed(2)}/mo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {isSelected(service.id) && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={getServicePrice(service.id, service.default_price)}
                    onChange={(e) =>
                      handlePriceChange(service.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">/month</span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedServices.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}
