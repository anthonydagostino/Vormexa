# Vormexa Desktop (Mac & Windows)

Vormexa ships as a native desktop app via [Tauri](https://tauri.app/) — the same
web codebase wrapped in a tiny native shell (Tauri apps are a few MB, not the
100 MB+ of Electron). Everything still runs 100% on-device.

The desktop app opens straight into the tools (it skips the marketing page).

---

## One-time setup on your Mac

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```
2. **Rust** (the Tauri build toolchain)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   # then restart your terminal, or: source "$HOME/.cargo/env"
   ```
3. **Node + pnpm** — you already have these for the web app.

That's it. Tauri uses macOS's built-in WebView, so there's nothing else to install.

---

## Run it in development

```bash
pnpm install
pnpm desktop:dev
```

This launches Vormexa in a real desktop window with hot-reload — edit the web
code and the app updates live.

---

## Build the Mac app

```bash
pnpm desktop:build
```

The installers land in `src-tauri/target/release/bundle/`:

- **`dmg/Vormexa_1.0.0_<arch>.dmg`** — the drag-to-install disk image you share.
- **`macos/Vormexa.app`** — the raw app bundle.

`<arch>` is `aarch64` on Apple Silicon (M1–M4) or `x64` on Intel.

### One app that runs on both Intel & Apple Silicon (recommended for distribution)

```bash
rustup target add x86_64-apple-darwin aarch64-apple-darwin
pnpm tauri build --target universal-apple-darwin
```

---

## Building the Windows app

Windows `.msi`/`.exe` installers must be built **on Windows** (you can't reliably
cross-compile them from a Mac). Two options:

- **Easiest — GitHub Actions:** the included workflow
  `.github/workflows/desktop-release.yml` builds **Mac + Windows** installers
  automatically. Push a version tag and download the installers from the GitHub
  Release it creates:
  ```bash
  git tag v1.0.0 && git push origin v1.0.0
  ```
- **Manually:** run `pnpm install && pnpm desktop:build` on a Windows PC (needs
  Rust + the "Desktop development with C++" workload from Visual Studio Build Tools).

---

## Signing & distribution

Unsigned apps trigger a security warning on first launch:

- **macOS (personal / testing):** right-click the app → **Open** → **Open** once.
- **macOS (public distribution):** to avoid the warning you need an **Apple
  Developer ID** ($99/yr) to code-sign and notarize. Set the signing env vars and
  Tauri handles it — see [Tauri macOS signing docs](https://tauri.app/distribute/sign/macos/).
- **Windows:** unsigned installers show a SmartScreen prompt; a code-signing
  certificate removes it. See [Tauri Windows signing docs](https://tauri.app/distribute/sign/windows/).

---

## How you sell it (this is your paid product)

The desktop app is the natural **Pro** offering — the model that earned the
previous owner most of the revenue. Two routes:

1. **Direct download + license** (simplest): host the `.dmg`/`.exe` on your site,
   gate downloads behind a Lemon Squeezy purchase, and reuse the same license-key
   activation the web app already has (`src/store/license.ts`).
2. **App stores:** Mac App Store / Microsoft Store. More setup (extra signing,
   sandbox entitlements) but gives you built-in discovery and store checkout.

---

## Performance notes & upgrade path

- The desktop app uses the **single-threaded** WebAssembly media engine by
  default — it works everywhere with zero extra setup.
- **Biggest future win:** bundle the **native `ffmpeg` binary** as a Tauri
  [sidecar](https://tauri.app/develop/sidecar/) and route video/audio jobs to it.
  That gives full-native speed with no browser memory limits — a genuine reason to
  pay for the desktop app over the free web version. This is a follow-up
  enhancement, not required for a first release.
