import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, Cpu, Play, ShieldCheck, X } from 'lucide-react'
import { Dropzone } from '@/components/ui/Dropzone'
import { FileList } from '@/components/ui/FileList'
import { Button, Progress, Badge } from '@/components/ui/primitives'
import { useProcessor, type JobContext } from '@/hooks/useProcessor'
import { engineMode, isMultiThreadAvailable } from '@/lib/ffmpeg'
import type { ToolMeta } from '@/tools/types'
import { formatPercent } from '@/lib/format'
import { usePro } from '@/hooks/usePro'
import { UpgradeGate } from '@/components/pro/UpgradeGate'
import { isBatchGated } from '@/lib/gate'

interface ToolFrameProps<TResult> {
  meta: ToolMeta
  /** Load the ffmpeg.wasm engine before running (video/audio tools). */
  engine?: boolean
  minFiles?: number
  reorderable?: boolean
  showThumbnails?: boolean
  actionLabel?: string
  helpNote?: ReactNode
  /** When set, processing more than this many files at once requires Pro. */
  proAboveCount?: number
  validate?: (files: File[]) => string | null
  controls?: (files: File[]) => ReactNode
  action: (files: File[], ctx: JobContext) => Promise<TResult>
  renderResult: (result: TResult, files: File[]) => ReactNode
}

export function ToolFrame<TResult>({
  meta,
  engine,
  minFiles = 1,
  reorderable,
  showThumbnails,
  actionLabel,
  helpNote,
  proAboveCount,
  validate,
  controls,
  action,
  renderResult,
}: ToolFrameProps<TResult>) {
  const [files, setFiles] = useState<File[]>([])
  const { isPro } = usePro()
  const { status, busy, progress, engineProgress, error, result, run, cancel, reset } =
    useProcessor<TResult>()

  const Icon = meta.icon

  const addFiles = useCallback(
    (incoming: File[]) => {
      reset()
      setFiles((prev) => (meta.multiple ? [...prev, ...incoming] : incoming.slice(0, 1)))
    },
    [meta.multiple, reset],
  )

  const removeFile = useCallback(
    (index: number) => {
      reset()
      setFiles((prev) => prev.filter((_, i) => i !== index))
    },
    [reset],
  )

  const reorder = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const thumbnails = useThumbnails(showThumbnails ? files : [])

  const validationError = useMemo(() => {
    if (files.length < minFiles) return null
    return validate?.(files) ?? null
  }, [files, minFiles, validate])

  const overFreeLimit = isBatchGated(files.length, proAboveCount, isPro)
  const canRun = files.length >= minFiles && !validationError && !overFreeLimit && !busy

  const handleRun = () => {
    run((ctx) => action(files, ctx), { engine })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        to="/app"
        className="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" /> All tools
      </Link>

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{meta.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {files.length === 0 ? (
          <Dropzone accept={meta.accept} multiple={meta.multiple} onFiles={addFiles} />
        ) : (
          <div className="flex flex-col gap-3">
            <FileList
              files={files}
              onRemove={removeFile}
              onReorder={reorderable ? reorder : undefined}
              reorderable={reorderable}
              thumbnails={thumbnails}
            />
            {meta.multiple && (
              <Dropzone
                accept={meta.accept}
                multiple
                onFiles={addFiles}
                compact
                className="min-h-0"
              />
            )}
          </div>
        )}

        {files.length >= minFiles && controls && <div className="card p-5">{controls(files)}</div>}

        {validationError && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {validationError}
          </div>
        )}

        {helpNote && files.length > 0 && (
          <p className="text-xs leading-relaxed text-slate-500">{helpNote}</p>
        )}

        {/* Action / progress */}
        {status === 'done' && result !== null ? (
          <>
            {renderResult(result, files)}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={reset} className="flex-1">
                Start over
              </Button>
              <Button onClick={handleRun} className="flex-1" disabled={!canRun}>
                Run again
              </Button>
            </div>
          </>
        ) : busy ? (
          <div key="busy" className="card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">
                {status === 'loading-engine'
                  ? 'Loading engine…'
                  : meta.category === 'pdf' || meta.category === 'image'
                    ? 'Processing…'
                    : 'Encoding…'}
              </span>
              <span className="tabular-nums text-slate-400">
                {formatPercent(status === 'loading-engine' ? engineProgress : progress)}
              </span>
            </div>
            <Progress value={status === 'loading-engine' ? engineProgress : progress} />
            <p className="text-xs text-slate-500">
              {status === 'loading-engine'
                ? 'Downloading the on-device media engine (first run only, then cached).'
                : 'Working entirely on your device — this can take a moment for large files.'}
            </p>
            <Button variant="outline" size="sm" icon={<X className="h-4 w-4" />} onClick={cancel}>
              Cancel
            </Button>
          </div>
        ) : overFreeLimit ? (
          <UpgradeGate
            title={`Process ${files.length} files at once`}
            benefit={`The free plan handles up to ${proAboveCount} file${proAboveCount === 1 ? '' : 's'} per job. Upgrade to Pro for unlimited batch & bulk processing.`}
          />
        ) : (
          <Button
            size="lg"
            className="w-full"
            icon={<Play className="h-5 w-5" />}
            disabled={!canRun}
            onClick={handleRun}
          >
            {actionLabel ?? meta.title}
          </Button>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <EngineFootnote engine={engine} />
      </div>
    </div>
  )
}

function EngineFootnote({ engine }: { engine?: boolean }) {
  const mode = engineMode()
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-4 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% on-device · nothing uploaded
      </span>
      {engine && (
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-brand-300" />
          {mode === 'not-loaded' ? (
            <>Engine: {isMultiThreadAvailable() ? 'multi-thread ready' : 'single-thread'}</>
          ) : (
            <>Engine: {mode}</>
          )}
        </span>
      )}
      {engine && !isMultiThreadAvailable() && (
        <Badge tone="neutral">Tip: multi-thread needs cross-origin isolation headers</Badge>
      )}
    </div>
  )
}

/** Generate (and revoke) object-URL thumbnails for image files. */
function useThumbnails(files: File[]): Record<number, string> {
  const [thumbs, setThumbs] = useState<Record<number, string>>({})
  useEffect(() => {
    const urls: string[] = []
    const map: Record<number, string> = {}
    files.forEach((file, i) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        map[i] = url
        urls.push(url)
      }
    })
    setThumbs(map)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])
  return thumbs
}
