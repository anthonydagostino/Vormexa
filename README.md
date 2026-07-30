<div align="center">

# Vormexa

### Video, Photo, Audio & PDF tools — all in one app. 100% on your device.

Compress, convert, resize and merge your media in seconds. No uploads, no sign-up,
no watermarks — every file is processed **locally in your browser**, so nothing
ever leaves your device.

</div>

---

## ✨ What it does

Vormexa is an all-in-one media toolkit for creators. It replaces a dozen
single-purpose websites with one fast, private app that works on **Mac, Windows,
Linux, iPhone and Android** — anywhere with a modern browser — and installs as a
PWA for offline use.

| Category | Tools |
| --- | --- |
| **🎬 Video** | Compress · Convert (MP4/WebM/MKV/MOV/GIF) · Resize · Trim · Merge · Extract audio · Video→GIF |
| **🖼️ Photo** | Compress (by quality or target size) · Convert (JPG/PNG/WebP) · Resize · Crop · Rotate & flip · Merge / collage |
| **🎵 Audio** | Convert (MP3/M4A/WAV/OGG/FLAC) · Compress · Trim · Merge |
| **📄 PDF** | Merge · Split · Images→PDF · PDF→Images · Compress · Rotate |

**23 tools**, all running fully client-side.

## 🔒 Privacy by design

The core promise: **your files are never uploaded.** All processing happens in
the browser using WebAssembly and native browser APIs. You can open your network
tab and confirm that no file data is ever sent anywhere.

- No accounts, tracking, or telemetry
- No file-size limits (bounded only by your device's memory)
- No watermarks
- Works completely offline once loaded (installable PWA)
- Fonts are self-hosted — **zero third-party requests**

## 🧱 How it's built

A single-page app with all media processing on the client:

| Concern | Technology |
| --- | --- |
| UI | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Video & audio | [`ffmpeg.wasm`](https://github.com/ffmpegwasm/ffmpeg.wasm) (self-hosted core, multi-thread when available) |
| Images | Canvas 2D API |
| PDFs | [`pdf-lib`](https://pdf-lib.js.org/) (write) + [`pdf.js`](https://mozilla.github.io/pdf.js/) (render) |
| Routing | React Router |
| Offline | Service worker + Web App Manifest |

### Why the browser?

The acquired product was a native Flutter app for Mac/Windows/iPhone. Vormexa
delivers the **same capabilities from a single codebase** that runs everywhere,
while keeping the headline features intact — offline, private, no server costs.
Because there's no backend, hosting is a static file drop and marginal cost per
user is effectively zero.

## 🚀 Getting started

```bash
# Install dependencies (postinstall copies the ffmpeg.wasm core into public/ffmpeg)
pnpm install

# Start the dev server (http://localhost:5173)
pnpm dev

# Type-check + production build → dist/
pnpm build

# Preview the production build locally
pnpm preview
```

> **Node 18+ and pnpm** are recommended. `npm install` / `npm run build` also work.

### Cross-origin isolation

`ffmpeg.wasm`'s multi-threaded core needs the page to be
[cross-origin isolated](https://web.dev/coop-coep/) (`SharedArrayBuffer`). The
dev server, `vercel.json`, and `public/_headers` all set the required
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers. When isolation isn't
available, Vormexa automatically falls back to the single-threaded core, so the
app keeps working — just a little slower.

## 📦 Deployment

The output in `dist/` is fully static. Any host works, as long as it:

1. Serves `index.html` for unknown routes (SPA fallback), and
2. Sends the COOP/COEP headers above.

Ready-made configs are included:

- **Vercel** → `vercel.json` (headers + rewrites)
- **Netlify / Cloudflare Pages** → `public/_headers` + `public/_redirects`

```bash
pnpm build && npx vercel deploy --prebuilt   # example
```

## 🗂️ Project structure

```
src/
├── lib/                 # Framework-free processing engines
│   ├── ffmpeg.ts        # ffmpeg.wasm loader (MT/ST auto-select) + run helper
│   ├── video.ts         # compress / convert / resize / trim / merge / gif
│   ├── audio.ts         # convert / compress / trim / merge
│   ├── image.ts         # canvas: compress / convert / resize / crop / collage
│   ├── pdf.ts           # pdf-lib + pdf.js: merge / split / convert / compress
│   ├── probe.ts         # metadata (duration/dimensions) via native elements
│   └── download.ts      # object-URL downloads + dependency-free .zip
├── hooks/               # useProcessor (run/progress/cancel), useMediaInfo
├── components/
│   ├── ui/              # design system (Button, Dropzone, Slider, …)
│   ├── layout/          # site + app shells, sidebar, footer
│   └── tools/           # ToolFrame + one component per tool, results
├── tools/               # tool registry (metadata + lazy components)
└── pages/               # Home (marketing), Pricing, Workspace, ToolPage
scripts/
└── copy-ffmpeg-core.mjs # copies the wasm core into public/ffmpeg (postinstall)
```

Each tool is a thin component that plugs options and a processing function into
the shared `ToolFrame`, which handles file selection, progress, cancellation,
errors and results. Adding a tool is mostly metadata + a `~40-line` component.

## 📈 Business model

Vormexa ships as **free** in the browser with paid **Pro** (native desktop apps,
batch processing, presets) and **Business** (commercial licensing, on-prem,
volume seats) tiers — see the in-app pricing page. Because there's no server-side
processing, gross margins stay high and the app scales without infrastructure.

## 📄 License

Proprietary — © Vormexa. All rights reserved.
