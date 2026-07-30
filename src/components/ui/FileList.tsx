import { ArrowDown, ArrowUp, File as FileIcon, X } from 'lucide-react'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/cn'

export function FileList({
  files,
  onRemove,
  onReorder,
  thumbnails,
  reorderable,
  className,
}: {
  files: File[]
  onRemove: (index: number) => void
  onReorder?: (from: number, to: number) => void
  thumbnails?: Record<number, string>
  reorderable?: boolean
  className?: string
}) {
  if (files.length === 0) return null
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-850 p-2.5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-800">
            {thumbnails?.[i] ? (
              <img src={thumbnails[i]} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileIcon className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          {reorderable && onReorder && (
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => onReorder(i, i - 1)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={i === files.length - 1}
                onClick={() => onReorder(i, i + 1)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onRemove(i)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/15 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
