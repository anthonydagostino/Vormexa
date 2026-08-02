import { describe, expect, it } from 'vitest'
import { isBatchGated } from './gate'

describe('isBatchGated', () => {
  it('never gates when no limit is configured', () => {
    expect(isBatchGated(100, undefined, false)).toBe(false)
  })
  it('never gates Pro users', () => {
    expect(isBatchGated(100, 3, true)).toBe(false)
  })
  it('allows Free users up to and including the limit', () => {
    expect(isBatchGated(1, 3, false)).toBe(false)
    expect(isBatchGated(3, 3, false)).toBe(false)
  })
  it('gates Free users above the limit', () => {
    expect(isBatchGated(4, 3, false)).toBe(true)
    expect(isBatchGated(50, 3, false)).toBe(true)
  })
  it('treats the exact boundary as allowed (strictly greater-than gates)', () => {
    expect(isBatchGated(3, 3, false)).toBe(false)
    expect(isBatchGated(4, 3, false)).toBe(true)
  })
  it('supports a zero allowance (any file gates a Free user)', () => {
    expect(isBatchGated(0, 0, false)).toBe(false)
    expect(isBatchGated(1, 0, false)).toBe(true)
  })
  it('never gates an empty job', () => {
    expect(isBatchGated(0, 3, false)).toBe(false)
  })
  it('Pro overrides even a zero allowance', () => {
    expect(isBatchGated(10, 0, true)).toBe(false)
  })
})
