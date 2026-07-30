import { describe, expect, it } from 'vitest'
import { ALL_TOOLS, CATEGORIES, TOOLS, getToolMeta, toolKey } from './registry-meta'
import { LAZY_TOOLS } from './lazy'

// Integration: guards the "keep metadata and components in sync" invariant that
// the CLAUDE.md architecture notes call out.
describe('tool registry integrity', () => {
  const categoryIds = new Set(CATEGORIES.map((c) => c.id))

  it('has a lazy component for every tool and vice versa', () => {
    expect(Object.keys(LAZY_TOOLS).sort()).toEqual(Object.keys(TOOLS).sort())
    for (const key of Object.keys(TOOLS)) {
      expect(LAZY_TOOLS[key as keyof typeof LAZY_TOOLS]).toBeTruthy()
    }
  })

  it('exposes a healthy number of tools', () => {
    expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(20)
  })

  it('has a unique category/slug for every tool', () => {
    const paths = ALL_TOOLS.map((t) => `${t.category}/${t.slug}`)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('only references known categories', () => {
    for (const tool of ALL_TOOLS) {
      expect(categoryIds.has(tool.category)).toBe(true)
    }
  })

  it('resolves each tool by its category/slug', () => {
    for (const tool of ALL_TOOLS) {
      expect(toolKey(tool.category, tool.slug)).toBeTruthy()
      expect(getToolMeta(tool.category, tool.slug)?.title).toBe(tool.title)
    }
    expect(getToolMeta('nope', 'missing')).toBeUndefined()
  })

  it('gives every tool the metadata the UI depends on', () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.title).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.accept).toBeTruthy()
      expect(tool.icon).toBeTypeOf('object')
    }
  })
})
