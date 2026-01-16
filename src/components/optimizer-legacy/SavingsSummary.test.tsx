import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsSummary } from './SavingsSummary'

describe('SavingsSummary', () => {
  it('renders current annual cost', () => {
    render(
      <SavingsSummary currentCost={191.88} optimizedCost={95.94} savings={95.94} />
    )

    expect(screen.getByText(/\$191\.88/)).toBeInTheDocument()
  })

  it('renders optimized annual cost', () => {
    render(
      <SavingsSummary currentCost={191.88} optimizedCost={80.00} savings={111.88} />
    )

    expect(screen.getByText(/\$80\.00/)).toBeInTheDocument()
  })

  it('renders savings amount', () => {
    render(
      <SavingsSummary currentCost={191.88} optimizedCost={95.94} savings={95.94} />
    )

    expect(screen.getByText(/Save \$95\.94/)).toBeInTheDocument()
  })

  it('shows positive savings with green styling', () => {
    render(
      <SavingsSummary currentCost={200} optimizedCost={100} savings={100} />
    )

    const savingsElement = screen.getByTestId('savings-amount')
    expect(savingsElement).toHaveClass('bg-green-50')
  })

  it('handles zero savings', () => {
    render(
      <SavingsSummary currentCost={100} optimizedCost={100} savings={0} />
    )

    expect(screen.getByText(/Save \$0\.00/)).toBeInTheDocument()
  })

  it('displays current and optimized labels', () => {
    render(
      <SavingsSummary currentCost={191.88} optimizedCost={95.94} savings={95.94} />
    )

    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/Optimized/i)).toBeInTheDocument()
  })

  it('formats currency with two decimal places', () => {
    render(
      <SavingsSummary currentCost={100.1} optimizedCost={75.05} savings={25.05} />
    )

    expect(screen.getByText(/\$100\.10/)).toBeInTheDocument()
    expect(screen.getByText(/\$75\.05/)).toBeInTheDocument()
  })
})
