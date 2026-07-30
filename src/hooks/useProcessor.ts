import { useCallback, useRef, useState } from 'react'
import { loadFFmpeg } from '@/lib/ffmpeg'

export type ProcessorStatus =
  'idle' | 'loading-engine' | 'processing' | 'done' | 'error' | 'cancelled'

export interface JobContext {
  signal: AbortSignal
  onProgress: (ratio: number) => void
}

export interface RunConfig {
  /** Load the ffmpeg.wasm engine before running (video/audio tools). */
  engine?: boolean
}

export function useProcessor<TResult>() {
  const [status, setStatus] = useState<ProcessorStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [engineProgress, setEngineProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setEngineProgress(0)
    setError(null)
    setResult(null)
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const run = useCallback(
    async (task: (ctx: JobContext) => Promise<TResult>, config: RunConfig = {}) => {
      const controller = new AbortController()
      abortRef.current = controller
      setError(null)
      setResult(null)
      setProgress(0)

      try {
        if (config.engine) {
          setStatus('loading-engine')
          setEngineProgress(0)
          await loadFFmpeg((r) => setEngineProgress(r))
          if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError')
        }

        setStatus('processing')
        const output = await task({
          signal: controller.signal,
          onProgress: (r) => setProgress(Math.max(0, Math.min(1, r))),
        })

        if (controller.signal.aborted) {
          setStatus('cancelled')
          return
        }
        setResult(output)
        setProgress(1)
        setStatus('done')
      } catch (err) {
        if (controller.signal.aborted || (err as Error)?.name === 'AbortError') {
          setStatus('cancelled')
          return
        }
        setError(normalizeError(err))
        setStatus('error')
      } finally {
        abortRef.current = null
      }
    },
    [],
  )

  const busy = status === 'loading-engine' || status === 'processing'

  return {
    status,
    busy,
    progress,
    engineProgress,
    error,
    result,
    run,
    cancel,
    reset,
    setResult,
  }
}

function normalizeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  if (/out of memory|OOM|memory access out of bounds|Aborted\(\)/i.test(message)) {
    return 'Ran out of memory. Try a smaller file, a lower resolution, or a stronger compression level.'
  }
  if (/exited with code/i.test(message)) {
    return `${message}. This file or format combination may be unsupported — try a different output format.`
  }
  return message || 'Something went wrong while processing.'
}
