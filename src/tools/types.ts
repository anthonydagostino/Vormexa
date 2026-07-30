import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

export type CategoryId = 'video' | 'image' | 'audio' | 'pdf'

export interface CategoryMeta {
  id: CategoryId
  label: string
  icon: LucideIcon
  blurb: string
  /** Tailwind gradient classes for accents. */
  gradient: string
  accent: string
}

export interface ToolMeta {
  slug: string
  category: CategoryId
  title: string
  short: string
  description: string
  icon: LucideIcon
  keywords: string[]
  /** File input accept attribute. */
  accept: string
  /** Whether the tool takes multiple files at once. */
  multiple: boolean
}

/** A tool paired with its React implementation (assembled in registry.tsx). */
export type RegisteredTool = ToolMeta & { Component: ComponentType }

export function toolPath(t: Pick<ToolMeta, 'category' | 'slug'>): string {
  return `/app/${t.category}/${t.slug}`
}
