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
})
