import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Content-Security-Policy that mirrors production (vercel.json / public/_headers)
// minus `upgrade-insecure-requests`, which only applies to the https site and
// would break the http preview server. Applied to `pnpm preview` so the e2e
// suite exercises the real CSP against the ffmpeg/pdf/canvas pipelines. NOT
// applied to the dev server (Vite HMR needs inline scripts + a ws: connection).
const CSP_PREVIEW =
  "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; " +
  "form-action 'self'; script-src 'self' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; " +
  "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; " +
  "font-src 'self' data:; connect-src 'self' blob: data: https://api.lemonsqueezy.com; " +
  "manifest-src 'self'"

// Cross-Origin isolation headers are required for ffmpeg.wasm multithreaded
// core (SharedArrayBuffer). We set them in dev; deploy configs (vercel.json,
// public/_headers) set them in production. The engine falls back to the
// single-threaded core when isolation is unavailable, so the app still works.
const crossOriginIsolation = {
  name: 'cross-origin-isolation',
  configureServer(server: {
    middlewares: {
      use: (
        fn: (
          req: unknown,
          res: { setHeader: (k: string, v: string) => void },
          next: () => void,
        ) => void,
      ) => void
    }
  }) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      next()
    })
  },
  configurePreviewServer(server: {
    middlewares: {
      use: (
        fn: (
          req: unknown,
          res: { setHeader: (k: string, v: string) => void },
          next: () => void,
        ) => void,
      ) => void
    }
  }) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Content-Security-Policy', CSP_PREVIEW)
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), crossOriginIsolation],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // ffmpeg packages ship their own workers/wasm; keep them out of the optimizer.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2500,
  },
})
