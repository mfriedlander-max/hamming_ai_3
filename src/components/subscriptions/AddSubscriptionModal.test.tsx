import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddSubscriptionModal } from './AddSubscriptionModal'
import type { Service } from './types'

const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Netflix',
    slug: 'netflix',
    logo_url: '/logos/netflix.png',
    default_price: 15.99,
    tmdb_provider_id: 8,
    cancel_url: 'https://netflix.com/cancel',
  },
  {
    id: 'service-2',
    name: 'Hulu',
    slug: 'hulu',
    logo_url: '/logos/hulu.png',
    default_price: 9.99,
    tmdb_provider_id: 15,
    cancel_url: 'https://hulu.com/cancel',
  },
]

describe('AddSubscriptionModal', () => {
  it('renders modal when open is true', () => {
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText(/add subscription/i)).toBeInTheDocument()
  })

  it('does not render modal when open is false', () => {
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={false}
        onClose={vi.fn()}
      />
    )

    expect(screen.queryByText(/add subscription/i)).not.toBeInTheDocument()
  })

  it('renders service dropdown with available services', () => {
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders price input', () => {
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/monthly cost/i)).toBeInTheDocument()
  })

  it('pre-fills price when service is selected', async () => {
    const user = userEvent.setup()
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={vi.fn()}
      />
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'service-1')

    const priceInput = screen.getByLabelText(/monthly cost/i) as HTMLInputElement
    expect(priceInput.value).toBe('15.99')
  })

  it('calls onAdd with service_id and monthly_cost when Add button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={onAdd}
        open={true}
        onClose={vi.fn()}
      />
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'service-1')

    const addButton = screen.getByRole('button', { name: /^add$/i })
    await user.click(addButton)

    expect(onAdd).toHaveBeenCalledWith({
      service_id: 'service-1',
      monthly_cost: 15.99,
    })
  })

  it('allows custom price to be entered', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={onAdd}
        open={true}
        onClose={vi.fn()}
      />
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'service-1')

    const priceInput = screen.getByLabelText(/monthly cost/i)
    await user.clear(priceInput)
    await user.type(priceInput, '19.99')

    const addButton = screen.getByRole('button', { name: /^add$/i })
    await user.click(addButton)

    expect(onAdd).toHaveBeenCalledWith({
      service_id: 'service-1',
      monthly_cost: 19.99,
    })
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={onClose}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables Add button when no service is selected', () => {
    render(
      <AddSubscriptionModal
        services={mockServices}
        onAdd={vi.fn()}
        open={true}
        onClose={vi.fn()}
      />
    )

    const addButton = screen.getByRole('button', { name: /^add$/i })
    expect(addButton).toBeDisabled()
  })
})
