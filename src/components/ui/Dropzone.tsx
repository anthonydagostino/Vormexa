import { useCallback, useId, useRef, useState, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Dropzone({
  accept,
  multiple,
  onFiles,
  className,
  compact,
  children,
}: {
  accept: string
  multiple: boolean
  onFiles: (files: File[]) => void
  className?: string
  compact?: boolean
  children?: ReactNode
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return
      const files = Array.from(list)
      onFiles(multiple ? files : files.slice(0, 1))
    },
    [multiple, onFiles],
  )

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all',
        compact ? 'gap-2 p-6' : 'gap-3 p-10',
        dragging
          ? 'border-brand-400 bg-brand-500/10 shadow-glow'
          : 'border-white/12 bg-ink-900/40 hover:border-brand-500/50 hover:bg-ink-850',
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      {children ?? (
        <>
          <div
            className={cn(
              'flex items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 transition-transform group-hover:scale-105',
              compact ? 'h-10 w-10' : 'h-14 w-14',
            )}
          >
            <UploadCloud className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
          </div>
          <div>
            <p className={cn('font-semibold text-slate-100', compact ? 'text-sm' : 'text-base')}>
              {dragging
                ? 'Drop to add'
                : multiple
                  ? 'Drop files or click to browse'
                  : 'Drop a file or click to browse'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Processed on your device — nothing is uploaded.
            </p>
          </div>
        </>
      )}
    </label>
  )
}
