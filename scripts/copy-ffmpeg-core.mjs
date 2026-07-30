/**
 * Copies the ffmpeg.wasm core files from node_modules into /public/ffmpeg so
 * they are served from our own origin. Serving locally is what makes Vormexa
 * work fully offline and keeps every byte on the user's device — no CDN, no
 * third-party requests. Run automatically via `postinstall`.
 */
import { mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'ffmpeg')
mkdirSync(outDir, { recursive: true })

const jobs = [
  // Single-threaded core (works everywhere, no cross-origin isolation needed).
  ['@ffmpeg/core/dist/esm/ffmpeg-core.js', 'ffmpeg-core.js'],
  ['@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'ffmpeg-core.wasm'],
  // Multithreaded core (faster; used when the page is cross-origin isolated).
  ['@ffmpeg/core-mt/dist/esm/ffmpeg-core.js', 'ffmpeg-core-mt.js'],
  ['@ffmpeg/core-mt/dist/esm/ffmpeg-core.wasm', 'ffmpeg-core-mt.wasm'],
  ['@ffmpeg/core-mt/dist/esm/ffmpeg-core.worker.js', 'ffmpeg-core-mt.worker.js'],
]

let copied = 0
for (const [from, to] of jobs) {
  const src = join(root, 'node_modules', from)
  const dest = join(outDir, to)
  if (!existsSync(src)) {
    console.warn(`[ffmpeg] missing: ${from} (skipping)`)
    continue
  }
  copyFileSync(src, dest)
  copied++
  console.log(`[ffmpeg] ${to}  (${(statSync(dest).size / 1e6).toFixed(1)} MB)`)
}
console.log(`[ffmpeg] copied ${copied}/${jobs.length} core file(s) → public/ffmpeg/`)
