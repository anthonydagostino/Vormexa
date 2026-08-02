import { describe, expect, it } from 'vitest'
import {
  CONTACT_EMAIL,
  FREE_BATCH_LIMIT,
  PRO_PRICE,
  lemon,
  paymentsConfigured,
} from './config'

// Locks the launch-critical monetization invariants so a bad edit (e.g. a blank
// checkout URL, a zero price, a broken support email) can't ship silently.
describe('monetization config', () => {
  it('has a positive one-time price', () => {
    expect(typeof PRO_PRICE).toBe('number')
    expect(PRO_PRICE).toBeGreaterThan(0)
  })

  it('has a sane free batch allowance', () => {
    expect(Number.isInteger(FREE_BATCH_LIMIT)).toBe(true)
    expect(FREE_BATCH_LIMIT).toBeGreaterThan(0)
  })

  it('reports payments as configured only when a checkout URL exists', () => {
    expect(paymentsConfigured).toBe(Boolean(lemon.checkoutUrl))
  })

  it('ships a valid https Lemon Squeezy checkout URL', () => {
    expect(lemon.checkoutUrl).toMatch(/^https:\/\//)
    expect(() => new URL(lemon.checkoutUrl)).not.toThrow()
  })

  it('has a plausible support email', () => {
    expect(CONTACT_EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  })

  it('names the store', () => {
    expect(lemon.storeName).toBeTruthy()
  })
})
