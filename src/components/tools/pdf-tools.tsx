import { useEffect, useState } from 'react'
import { Field, Segmented, Slider } from '@/components/ui/primitives'
import { ToolFrame } from './ToolFrame'
import { MultiResult, SingleResult } from './results'
import { TOOLS } from '@/tools/registry-meta'
import { outputName, stripExtension } from '@/lib/format'
import { FREE_BATCH_LIMIT } from '@/config'
import {
  compressPdf,
  extractPages,
  getPdfPageCount,
  imagesToPdf,
  mergePdfs,
  parsePageRanges,
  pdfToImages,
  rotatePdf,
  splitToPages,
  type PageSize,
} from '@/lib/pdf'
import type { ImageFormat } from '@/lib/image'

// ── Merge ──
interface PdfSingle {
  blob: Blob
  filename: string
  originalSize?: number
}

export function PdfMerge() {
  return (
    <ToolFrame<PdfSingle>
      meta={TOOLS.pdfMerge}
      minFiles={2}
      reorderable
      proAboveCount={FREE_BATCH_LIMIT}
      actionLabel="Merge PDFs"
      action={async (files, ctx) => {
        const blob = await mergePdfs(files, { onProgress: ctx.onProgress, signal: ctx.signal })
        return {
          blob,
          filename: 'vormexa-merged.pdf',
          originalSize: files.reduce((n, f) => n + f.size, 0),
        }
      }}
      renderResult={(r) => (
        <SingleResult
          blob={r.blob}
          filename={r.filename}
          originalSize={r.originalSize}
          kind="pdf"
        />
      )}
    />
  )
}

// ── Split ──
type SplitResult =
  | { type: 'single'; blob: Blob; filename: string }
  | { type: 'multi'; items: { name: string; blob: Blob }[] }

export function PdfSplit() {
  const [mode, setMode] = useState<'each' | 'range'>('each')
  const [ranges, setRanges] = useState('1-1')

  return (
    <ToolFrame<SplitResult>
      meta={TOOLS.pdfSplit}
      actionLabel="Split PDF"
      validate={() =>
        mode === 'range' && !ranges.trim() ? 'Enter a page range, e.g. 1-3, 5.' : null
      }
      controls={(files) => (
        <SplitFields
          file={files[0]}
          mode={mode}
          setMode={setMode}
          ranges={ranges}
          setRanges={setRanges}
        />
      )}
      action={async (files, ctx) => {
        const file = files[0]
        if (mode === 'each') {
          const items = await splitToPages(file, { onProgress: ctx.onProgress, signal: ctx.signal })
          return { type: 'multi', items }
        }
        const count = await getPdfPageCount(file)
        const indices = parsePageRanges(ranges, count)
        if (indices.length === 0) throw new Error('No valid pages in that range.')
        const blob = await extractPages(file, indices, {
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { type: 'single', blob, filename: outputName(file.name, 'pages', 'pdf') }
      }}
      renderResult={(r, files) =>
        r.type === 'single' ? (
          <SingleResult blob={r.blob} filename={r.filename} kind="pdf" />
        ) : (
          <MultiResult
            items={r.items}
            zipName={`${stripExtension(files[0].name)}-pages.zip`}
            kind="file"
          />
        )
      }
    />
  )
}

function SplitFields({
  file,
  mode,
  setMode,
  ranges,
  setRanges,
}: {
  file: File
  mode: 'each' | 'range'
  setMode: (v: 'each' | 'range') => void
  ranges: string
  setRanges: (v: string) => void
}) {
  const count = usePdfPageCount(file)
  return (
    <div className="flex flex-col gap-5">
      {count > 0 && <p className="text-xs text-slate-500">{count} pages</p>}
      <Field label="Split mode">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'each', label: 'Every page' },
            { value: 'range', label: 'Page range' },
          ]}
        />
      </Field>
      {mode === 'range' && (
        <Field label="Pages to extract" hint="Examples: 1-3, 5, 8-10">
          <input
            className="input"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
            placeholder="1-3, 5"
          />
        </Field>
      )}
    </div>
  )
}

// ── Images to PDF ──
export function ImagesToPdf() {
  const [pageSize, setPageSize] = useState<PageSize>('fit')
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto')
  const [margin, setMargin] = useState(0)

  return (
    <ToolFrame<PdfSingle>
      meta={TOOLS.imagesToPdf}
      minFiles={1}
      reorderable
      showThumbnails
      proAboveCount={FREE_BATCH_LIMIT}
      actionLabel="Create PDF"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Page size">
            <Segmented
              value={pageSize}
              onChange={setPageSize}
              options={[
                { value: 'fit', label: 'Fit image' },
                { value: 'a4', label: 'A4' },
                { value: 'letter', label: 'Letter' },
              ]}
            />
          </Field>
          {pageSize !== 'fit' && (
            <>
              <Field label="Orientation">
                <Segmented
                  value={orientation}
                  onChange={setOrientation}
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'portrait', label: 'Portrait' },
                    { value: 'landscape', label: 'Landscape' },
                  ]}
                />
              </Field>
              <Field label={`Margin · ${margin}pt`}>
                <Slider
                  min={0}
                  max={72}
                  value={margin}
                  onChange={(v) => setMargin(Math.round(v))}
                />
              </Field>
            </>
          )}
        </div>
      )}
      action={async (files, ctx) => {
        const blob = await imagesToPdf(files, {
          pageSize,
          orientation,
          margin,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: 'vormexa-images.pdf',
          originalSize: files.reduce((n, f) => n + f.size, 0),
        }
      }}
      renderResult={(r) => <SingleResult blob={r.blob} filename={r.filename} kind="pdf" />}
    />
  )
}

// ── PDF to Images ──
export function PdfToImages() {
  const [format, setFormat] = useState<ImageFormat>('jpeg')
  const [scale, setScale] = useState(2)

  return (
    <ToolFrame<{ items: { name: string; blob: Blob }[] }>
      meta={TOOLS.pdfToImages}
      actionLabel="Convert to images"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Image format">
            <Segmented
              value={format}
              onChange={(v) => setFormat(v as ImageFormat)}
              options={[
                { value: 'jpeg', label: 'JPG' },
                { value: 'png', label: 'PNG' },
              ]}
            />
          </Field>
          <Field
            label={`Quality / resolution · ${Math.round(scale * 72)} dpi`}
            hint="Higher = sharper & larger files."
          >
            <Slider min={1} max={4} step={0.5} value={scale} onChange={setScale} />
          </Field>
        </div>
      )}
      action={async (files, ctx) => {
        const items = await pdfToImages(files[0], {
          format,
          scale,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { items }
      }}
      renderResult={(r, files) => (
        <MultiResult
          items={r.items}
          zipName={`${stripExtension(files[0].name)}-images.zip`}
          kind="image"
        />
      )}
    />
  )
}

// ── Compress ──
export function PdfCompress() {
  const [level, setLevel] = useState<'light' | 'balanced' | 'strong'>('balanced')
  const map = {
    light: { quality: 0.75, scale: 2 },
    balanced: { quality: 0.6, scale: 1.5 },
    strong: { quality: 0.45, scale: 1.2 },
  } as const

  return (
    <ToolFrame<PdfSingle>
      meta={TOOLS.pdfCompress}
      actionLabel="Compress PDF"
      helpNote="Pages are optimized to images — best for scanned or image-heavy PDFs. Selectable text becomes part of the page image."
      controls={() => (
        <Field label="Compression level">
          <Segmented
            value={level}
            onChange={setLevel}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'strong', label: 'Strong' },
            ]}
          />
        </Field>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { quality, scale } = map[level]
        const blob = await compressPdf(file, {
          quality,
          scale,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: outputName(file.name, 'compressed', 'pdf'),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult
          blob={r.blob}
          filename={r.filename}
          originalSize={r.originalSize}
          kind="pdf"
        />
      )}
    />
  )
}

// ── Rotate ──
export function PdfRotate() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  return (
    <ToolFrame<PdfSingle>
      meta={TOOLS.pdfRotate}
      actionLabel="Rotate PDF"
      controls={() => (
        <Field label="Rotation">
          <Segmented
            value={String(angle)}
            onChange={(v) => setAngle(Number(v) as 90 | 180 | 270)}
            options={[
              { value: '90', label: '90° ↻' },
              { value: '180', label: '180°' },
              { value: '270', label: '270° ↺' },
            ]}
          />
        </Field>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const blob = await rotatePdf(file, angle, {
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, 'rotated', 'pdf'), originalSize: file.size }
      }}
      renderResult={(r) => (
        <SingleResult
          blob={r.blob}
          filename={r.filename}
          originalSize={r.originalSize}
          kind="pdf"
        />
      )}
    />
  )
}

// Shared: page-count probe for PDF controls.
function usePdfPageCount(file: File): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let active = true
    getPdfPageCount(file)
      .then((c) => active && setCount(c))
      .catch(() => active && setCount(0))
    return () => {
      active = false
    }
  }, [file])
  return count
}
