import { describe, expect, it } from 'vitest'
import { parsePageRanges } from './pdf-ranges'

// parsePageRanges is pure and doesn't touch pdf.js/pdf-lib, so it's a clean unit.
describe('parsePageRanges', () => {
  it('parses single pages (1-based → 0-based)', () => {
    expect(parsePageRanges('1', 10)).toEqual([0])
    expect(parsePageRanges('1, 3, 5', 10)).toEqual([0, 2, 4])
  })
  it('parses ranges and normalizes reversed ranges', () => {
    expect(parsePageRanges('1-3', 10)).toEqual([0, 1, 2])
    expect(parsePageRanges('3-1', 10)).toEqual([0, 1, 2])
  })
  it('deduplicates and sorts overlapping input', () => {
    expect(parsePageRanges('5, 1-3, 2', 10)).toEqual([0, 1, 2, 4])
  })
  it('clamps out-of-bounds pages', () => {
    expect(parsePageRanges('0, 1, 99', 3)).toEqual([0])
    expect(parsePageRanges('2-100', 3)).toEqual([1, 2])
  })
  it('ignores junk gracefully', () => {
    expect(parsePageRanges('', 5)).toEqual([])
    expect(parsePageRanges('abc, , -', 5)).toEqual([])
  })
})
