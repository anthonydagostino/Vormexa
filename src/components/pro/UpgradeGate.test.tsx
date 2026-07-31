import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UpgradeGate } from './UpgradeGate'

// Integration: renders the real upsell component (config + router + markup).
describe('<UpgradeGate />', () => {
  function renderGate() {
    return render(
      <MemoryRouter>
        <UpgradeGate title="Process 4 files at once" benefit="Upgrade for unlimited batch." />
      </MemoryRouter>,
    )
  }

  it('labels itself as a Pro feature and shows the title & benefit', () => {
    renderGate()
    expect(screen.getByText('Pro feature')).toBeInTheDocument()
    expect(screen.getByText('Process 4 files at once')).toBeInTheDocument()
    expect(screen.getByText('Upgrade for unlimited batch.')).toBeInTheDocument()
  })

  it('offers both a purchase path and a license-activation path', () => {
    renderGate()
    // With checkout configured, the buy CTA points at the hosted checkout.
    const buy = screen.getByRole('link', { name: /Unlock Pro/i })
    expect(buy.getAttribute('href')).toContain('lemonsqueezy.com')
    expect(screen.getByRole('link', { name: /license key/i })).toHaveAttribute(
      'href',
      '/app/account',
    )
  })
})
