import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { safeVfsName } from './format'

/**
 * Single shared ffmpeg.wasm instance. Everything runs inside the browser —
 * the core `.wasm` is served from our own origin (public/ffmpeg), so no file
 * and no request ever leaves the user's device.
 */

export type LoadProgress = (ratio: number) => void
export type RunProgress = (ratio: number) => void
export type LogHandler = (message: string) => void

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null
let usingMultiThread = false

const CORE_BASE = `${import.meta.env.BASE_URL}ffmpeg`

export function isMultiThreadAvailable(): boolean {
  return typeof window !== 'undefined' && window.crossOriginIsolated === true
}

export function isEngineLoaded(): boolean {
  return ffmpeg !== null && ffmpeg.loaded
}

export function engineMode(): 'multi-thread' | 'single-thread' | 'not-loaded' {
  if (!isEngineLoaded()) return 'not-loaded'
  return usingMultiThread ? 'multi-thread' : 'single-thread'
}

/** Load (once) and return the shared ffmpeg instance. */
export async function loadFFmpeg(onProgress?: LoadProgress): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const instance = new FFmpeg()
    const mt = isMultiThreadAvailable()
    usingMultiThread = mt

    const coreName = mt ? 'ffmpeg-core-mt' : 'ffmpeg-core'
    // Report coarse download progress across the (large) wasm fetch.
    let done = 0
    const total = mt ? 3 : 2
    const bump = () => {
      done += 1
      onProgress?.(done / total)
    }

    const coreURL = await toBlobURL(`${CORE_BASE}/${coreName}.js`, 'text/javascript').then((u) => {
      bump()
      return u
    })
    const wasmURL = await toBlobURL(`${CORE_BASE}/${coreName}.wasm`, 'application/wasm').then(
      (u) => {
        bump()
        return u
      },
    )

    const config: Record<string, string> = { coreURL, wasmURL }
    if (mt) {
      config.workerURL = await toBlobURL(
        `${CORE_BASE}/${coreName}.worker.js`,
        'text/javascript',
      ).then((u) => {
        bump()
        return u
      })
    }

    await instance.load(config)
    ffmpeg = instance
    return instance
  })()

  try {
    return await loadPromise
  } catch (err) {
    loadPromise = null
    throw err
  }
}

export interface RunOptions {
  /** Files to place in the virtual FS before running. */
  inputs: { name: string; data: Uint8Array }[]
  /** ffmpeg CLI args (reference inputs/outputs by their VFS names). */
  args: string[]
  /** Output file names to read back after the run. */
  outputs: string[]
  /** Total media duration (seconds) used to derive a progress ratio. */
  durationSec?: number
  onProgress?: RunProgress
  onLog?: LogHandler
  signal?: AbortSignal
}

export interface RunResult {
  outputs: { name: string; data: Uint8Array }[]
}

/**
 * Write inputs → run ffmpeg → read outputs → clean up the virtual FS.
 * Safe to call concurrently is NOT guaranteed (single shared core), so tools
 * should await one run at a time.
 */
export async function runFFmpeg(opts: RunOptions): Promise<RunResult> {
  const ff = await loadFFmpeg()

  let lastRatio = 0
  const progressHandler = ({ progress, time }: { progress: number; time: number }) => {
    let ratio = progress
    if ((!ratio || ratio <= 0 || ratio > 1.5) && opts.durationSec && opts.durationSec > 0) {
      ratio = time / 1e6 / opts.durationSec
    }
    ratio = Math.max(0, Math.min(1, ratio))
    if (ratio >= lastRatio) {
      lastRatio = ratio
      opts.onProgress?.(ratio)
    }
  }
  const logHandler = ({ message }: { message: string }) => opts.onLog?.(message)

  ff.on('progress', progressHandler)
  if (opts.onLog) ff.on('log', logHandler)

  const abortHandler = () => {
    try {
      ff.terminate()
    } catch {
      /* noop */
    }
    // Force a fresh instance next time after a hard terminate.
    ffmpeg = null
    loadPromise = null
  }
  opts.signal?.addEventListener('abort', abortHandler)

  try {
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    for (const input of opts.inputs) {
      await ff.writeFile(input.name, input.data)
    }

    const code = await ff.exec(opts.args)
    if (code !== 0 && !opts.signal?.aborted) {
      throw new Error(`ffmpeg exited with code ${code}`)
    }

    const results: { name: string; data: Uint8Array }[] = []
    for (const out of opts.outputs) {
      const data = (await ff.readFile(out)) as Uint8Array
      results.push({ name: out, data })
    }

    // Best-effort cleanup so the VFS doesn't accumulate between runs.
    for (const input of opts.inputs) {
      await ff.deleteFile(input.name).catch(() => undefined)
    }
    for (const out of opts.outputs) {
      await ff.deleteFile(out).catch(() => undefined)
    }

    opts.onProgress?.(1)
    return { outputs: results }
  } finally {
    ff.off('progress', progressHandler)
    if (opts.onLog) ff.off('log', logHandler)
    opts.signal?.removeEventListener('abort', abortHandler)
  }
}

/** Convenience: unique, filesystem-safe VFS name for an input file. */
let counter = 0
export function vfsName(original: string): string {
  counter = (counter + 1) % 1_000_000
  return `${counter}_${safeVfsName(original)}`
}
