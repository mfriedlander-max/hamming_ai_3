import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ServiceSelector } from './ServiceSelector'

// Mock Supabase client
const mockServices = [
  { id: '1', name: 'Netflix', slug: 'netflix', default_price: 15.99, logo_url: null },
  { id: '2', name: 'Hulu', slug: 'hulu', default_price: 9.99, logo_url: null },
  { id: '3', name: 'Disney+', slug: 'disney-plus', default_price: 7.99, logo_url: null },
]

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: mockServices, error: null }),
      }),
    }),
  }),
}))

describe('ServiceSelector', () => {
  const defaultProps = {
    onNext: vi.fn(),
    onBack: vi.fn(),
    selectedServices: [] as Array<{ service_id: string; monthly_cost: number }>,
    onServicesChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<ServiceSelector {...defaultProps} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays services grid after loading', async () => {
    render(<ServiceSelector {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('Hulu')).toBeInTheDocument()
      expect(screen.getByText('Disney+')).toBeInTheDocument()
    })
  })

  it('shows checkbox for each service', async () => {
    render(<ServiceSelector {...defaultProps} />)

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
    })
  })

  it('shows price input when service is selected', async () => {
    const onServicesChange = vi.fn()
    render(<ServiceSelector {...defaultProps} onServicesChange={onServicesChange} />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // Select Netflix

    expect(onServicesChange).toHaveBeenCalledWith([
      { service_id: '1', monthly_cost: 15.99 }
    ])
  })

  it('removes service when unchecked', async () => {
    const onServicesChange = vi.fn()
    render(
      <ServiceSelector
        {...defaultProps}
        selectedServices={[{ service_id: '1', monthly_cost: 15.99 }]}
        onServicesChange={onServicesChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // Uncheck Netflix

    expect(onServicesChange).toHaveBeenCalledWith([])
  })

  it('calls onNext when Continue button is clicked with selected services', async () => {
    const onNext = vi.fn()
    render(
      <ServiceSelector
        {...defaultProps}
        selectedServices={[{ service_id: '1', monthly_cost: 15.99 }]}
        onNext={onNext}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('disables Continue button when no services are selected', async () => {
    render(<ServiceSelector {...defaultProps} selectedServices={[]} />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('calls onBack when Back button is clicked', async () => {
    const onBack = vi.fn()
    render(<ServiceSelector {...defaultProps} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('updates price when user changes input', async () => {
    const onServicesChange = vi.fn()
    render(
      <ServiceSelector
        {...defaultProps}
        selectedServices={[{ service_id: '1', monthly_cost: 15.99 }]}
        onServicesChange={onServicesChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })

    const priceInput = screen.getByDisplayValue('15.99') as HTMLInputElement
    fireEvent.change(priceInput, { target: { value: '19.99' } })

    expect(onServicesChange).toHaveBeenLastCalledWith([
      { service_id: '1', monthly_cost: 19.99 }
    ])
  })
})
