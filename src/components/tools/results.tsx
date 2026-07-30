import { useEffect, useMemo, useState } from 'react'
import { Check, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { downloadBlob, downloadZip } from '@/lib/download'
import { formatBytes, sizeDelta } from '@/lib/format'
import { cn } from '@/lib/cn'

export type ResultKind = 'image' | 'video' | 'audio' | 'pdf' | 'file'

function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) return
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

export function SingleResult({
  blob,
  filename,
  originalSize,
  kind,
}: {
  blob: Blob
  filename: string
  originalSize?: number
  kind: ResultKind
}) {
  const url = useObjectUrl(blob)
  const delta = originalSize ? sizeDelta(originalSize, blob.size) : ''
  const smaller = originalSize ? blob.size < originalSize : false

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5 text-sm font-medium text-emerald-300">
        <Check className="h-4 w-4" /> Done — saved on your device
      </div>

      {url && kind === 'image' && (
        <div className="flex justify-center bg-[repeating-conic-gradient(#1a1a28_0%_25%,#14141f_0%_50%)] bg-[length:20px_20px] p-4">
          <img src={url} alt={filename} className="max-h-80 rounded-lg object-contain" />
        </div>
      )}
      {url && kind === 'video' && (
        <div className="flex justify-center bg-black/40 p-3">
          <video src={url} controls className="max-h-80 rounded-lg" />
        </div>
      )}
      {url && kind === 'audio' && (
        <div className="px-4 py-6">
          <audio src={url} controls className="w-full" />
        </div>
      )}
      {kind === 'pdf' && (
        <div className="flex items-center justify-center gap-3 px-4 py-8 text-slate-400">
          <FileText className="h-8 w-8 text-brand-300" />
          <span className="text-sm">PDF ready to download</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">{filename}</p>
          <p className="text-xs text-slate-500">
            {formatBytes(blob.size)}
            {delta && (
              <span
                className={cn('ml-2 font-medium', smaller ? 'text-emerald-400' : 'text-amber-400')}
              >
                {delta} vs original
              </span>
            )}
          </p>
        </div>
        <Button
          icon={<Download className="h-4 w-4" />}
          onClick={() => downloadBlob(blob, filename)}
        >
          Download
        </Button>
      </div>
    </div>
  )
}

export function MultiResult({
  items,
  zipName,
  kind = 'file',
}: {
  items: { name: string; blob: Blob }[]
  zipName: string
  kind?: ResultKind
}) {
  const totalSize = useMemo(() => items.reduce((n, it) => n + it.blob.size, 0), [items])

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-300">
          <Check className="h-4 w-4" /> {items.length} file{items.length > 1 ? 's' : ''} ·{' '}
          {formatBytes(totalSize)}
        </span>
        <Button
          size="sm"
          icon={<Download className="h-4 w-4" />}
          onClick={() =>
            downloadZip(
              items.map((it) => ({ name: it.name, data: it.blob })),
              zipName,
            )
          }
        >
          Download all (.zip)
        </Button>
      </div>
      <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
        {items.map((it, i) => (
          <MultiRow key={i} item={it} kind={kind} />
        ))}
      </ul>
    </div>
  )
}

function MultiRow({ item, kind }: { item: { name: string; blob: Blob }; kind: ResultKind }) {
  const url = useObjectUrl(item.blob)
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink-800">
        {url && kind === 'image' ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
        )}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{item.name}</span>
      <span className="text-xs text-slate-500">{formatBytes(item.blob.size)}</span>
      <button
        type="button"
        onClick={() => downloadBlob(item.blob, item.name)}
        className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-brand-300"
        aria-label={`Download ${item.name}`}
      >
        <Download className="h-4 w-4" />
      </button>
    </li>
  )
}
