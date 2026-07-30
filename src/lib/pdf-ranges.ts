/**
 * Pure page-range parsing, kept dependency-free (no pdf.js / pdf-lib) so it can
 * be imported and unit-tested without pulling in the heavy PDF engines.
 */

/** Parse a page-range string like "1-3, 5, 8-10" into sorted zero-based indices. */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const result = new Set<number>()
  for (const part of input.split(',')) {
    const token = part.trim()
    if (!token) continue
    const range = token.split('-').map((s) => parseInt(s.trim(), 10))
    if (range.length === 1 && Number.isFinite(range[0])) {
      const p = range[0]
      if (p >= 1 && p <= pageCount) result.add(p - 1)
    } else if (range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1])) {
      const [a, b] = [Math.min(...range), Math.max(...range)]
      for (let p = a; p <= b; p++) if (p >= 1 && p <= pageCount) result.add(p - 1)
    }
  }
  return [...result].sort((x, y) => x - y)
}
