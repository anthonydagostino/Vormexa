/**
 * Generates public/sitemap.xml from the known routes so search engines can
 * discover every tool page. Re-run after adding/removing tools:
 *   node scripts/gen-sitemap.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ORIGIN = 'https://getvormexa.com'

// Keep in sync with src/tools/registry-meta.ts (category → slugs).
const TOOLS = {
  video: ['compress', 'convert', 'resize', 'trim', 'merge', 'extract-audio', 'to-gif'],
  image: ['compress', 'convert', 'resize', 'crop', 'rotate', 'merge'],
  audio: ['convert', 'compress', 'trim', 'merge'],
  pdf: ['merge', 'split', 'images-to-pdf', 'to-images', 'compress', 'rotate'],
}

const routes = [
  '/',
  '/pricing',
  '/app',
  '/privacy',
  '/terms',
  ...Object.entries(TOOLS).flatMap(([cat, slugs]) => slugs.map((s) => `/app/${cat}/${s}`)),
]

const urls = routes
  .map((r) => {
    const priority = r === '/' ? '1.0' : r.startsWith('/app/') ? '0.8' : '0.6'
    return `  <url>\n    <loc>${ORIGIN}${r}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')
writeFileSync(out, xml)
console.log(`[sitemap] wrote ${routes.length} urls → public/sitemap.xml`)
