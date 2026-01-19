import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickAddService } from './QuickAddService'

const mockServices = [
  { id: 'netflix', name: 'Netflix', default_price: 15.99 },
  { id: 'hulu', name: 'Hulu', default_price: 7.99 },
  { id: 'disney-plus', name: 'Disney+', default_price: 10.99 },
]

describe('QuickAddService', () => {
  const defaultProps = {
    services: mockServices,
    onAdd: vi.fn(),
    onSkip: vi.fn(),
  }

  it('renders service dropdown with available services', () => {
    render(<QuickAddService {...defaultProps} />)

    const dropdown = screen.getByRole('combobox')
    expect(dropdown).toBeInTheDocument()

    fireEvent.click(dropdown)

    mockServices.forEach((service) => {
      expect(screen.getByText(service.name)).toBeInTheDocument()
    })
  })

  it('shows price input field', () => {
    render(<QuickAddService {...defaultProps} />)

    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/9\.99/i)).toBeInTheDocument()
  })

  it('calls onAdd with service selection and price', async () => {
    const onAdd = vi.fn()
    render(<QuickAddService {...defaultProps} onAdd={onAdd} />)

    // Select service
    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: 'netflix' } })

    // Enter price
    const priceInput = screen.getByLabelText(/price/i)
    fireEvent.change(priceInput, { target: { value: '15.99' } })

    // Click add
    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('netflix', 15.99)
    })
  })

  it('validates required fields', () => {
    render(<QuickAddService {...defaultProps} />)

    const addButton = screen.getByRole('button', { name: /add/i })

    // Button should be disabled when no service selected
    expect(addButton).toBeDisabled()

    // Select service - price will be auto-filled
    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: 'netflix' } })

    // Enabled because service selected and price auto-filled
    expect(addButton).not.toBeDisabled()

    // Clear price - should disable again
    const priceInput = screen.getByLabelText(/price/i)
    fireEvent.change(priceInput, { target: { value: '' } })
    expect(addButton).toBeDisabled()

    // Add price back
    fireEvent.change(priceInput, { target: { value: '15.99' } })
    expect(addButton).not.toBeDisabled()
  })

  it('calls onSkip when skip button clicked', () => {
    const onSkip = vi.fn()
    render(<QuickAddService {...defaultProps} onSkip={onSkip} />)

    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(onSkip).toHaveBeenCalled()
  })

  it('auto-fills price when service is selected', () => {
    render(<QuickAddService {...defaultProps} />)

    const dropdown = screen.getByRole('combobox')
    fireEvent.change(dropdown, { target: { value: 'netflix' } })

    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement
    expect(priceInput.value).toBe('15.99')
  })
})
