import { useState } from 'react'
import { Field, NumberInput, Segmented, Select, Slider, Toggle } from '@/components/ui/primitives'
import { ToolFrame } from './ToolFrame'
import { SingleResult } from './results'
import { TOOLS } from '@/tools/registry-meta'
import { useMediaInfo } from '@/hooks/useMediaInfo'
import {
  compressToTarget,
  createCollage,
  processImage,
  IMAGE_EXT,
  type CollageLayout,
  type ImageFormat,
  type ResizeMode,
} from '@/lib/image'
import { outputName } from '@/lib/format'
import { FREE_BATCH_LIMIT } from '@/config'

type OutFormat = 'auto' | ImageFormat

function resolveFormat(fmt: OutFormat, file: File): ImageFormat {
  if (fmt !== 'auto') return fmt
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('webp')) return 'webp'
  return 'jpeg'
}

const FORMAT_OPTIONS = (
  <>
    <option value="auto">Keep original</option>
    <option value="jpeg">JPEG</option>
    <option value="png">PNG</option>
    <option value="webp">WebP</option>
  </>
)

interface ImgResult {
  blob: Blob
  filename: string
  originalSize: number
}

// ── Compress ────────────────────────────────────────────────────────────────
export function ImageCompress() {
  const [format, setFormat] = useState<OutFormat>('auto')
  const [mode, setMode] = useState<'quality' | 'target'>('quality')
  const [quality, setQuality] = useState(0.7)
  const [targetKb, setTargetKb] = useState<number | ''>(200)
  const [maxWidth, setMaxWidth] = useState<number | ''>('')

  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageCompress}
      showThumbnails
      actionLabel="Compress image"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Output format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
              {FORMAT_OPTIONS}
            </Select>
          </Field>
          <Field label="Compression target">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'quality', label: 'By quality' },
                { value: 'target', label: 'By file size' },
              ]}
            />
          </Field>
          {mode === 'quality' ? (
            <Field label={`Quality · ${Math.round(quality * 100)}%`} hint="Lower quality = smaller file.">
              <Slider min={0.3} max={0.95} step={0.01} value={quality} onChange={setQuality} />
            </Field>
          ) : (
            <Field label="Target size" hint="We search for the highest quality under this size.">
              <NumberInput value={targetKb} onChange={setTargetKb} suffix="KB" min={10} />
            </Field>
          )}
          <Field label="Max width (optional)" hint="Downscale wide images to save more.">
            <NumberInput value={maxWidth} onChange={setMaxWidth} suffix="px" placeholder="e.g. 1920" />
          </Field>
        </div>
      )}
      action={async (files) => {
        const file = files[0]
        const fmt = resolveFormat(format === 'auto' ? 'jpeg' : format, file)
        const resize = maxWidth ? { width: Number(maxWidth), noUpscale: true } : undefined
        const result =
          mode === 'target' && targetKb
            ? await compressToTarget(file, fmt, Number(targetKb) * 1024, resize)
            : await processImage(file, { format: fmt, quality, resize })
        return {
          blob: result.blob,
          filename: outputName(file.name, 'compressed', IMAGE_EXT[fmt]),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult blob={r.blob} filename={r.filename} originalSize={r.originalSize} kind="image" />
      )}
    />
  )
}

// ── Convert ─────────────────────────────────────────────────────────────────
export function ImageConvert() {
  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(0.9)
  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageConvert}
      showThumbnails
      actionLabel="Convert image"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Convert to">
            <Select value={format} onChange={(e) => setFormat(e.target.value as ImageFormat)}>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </Select>
          </Field>
          {format !== 'png' && (
            <Field label={`Quality · ${Math.round(quality * 100)}%`}>
              <Slider min={0.3} max={1} step={0.01} value={quality} onChange={setQuality} />
            </Field>
          )}
        </div>
      )}
      action={async (files) => {
        const file = files[0]
        const result = await processImage(file, { format, quality })
        return {
          blob: result.blob,
          filename: outputName(file.name, '', IMAGE_EXT[format]),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult blob={r.blob} filename={r.filename} originalSize={r.originalSize} kind="image" />
      )}
    />
  )
}

// ── Resize ──────────────────────────────────────────────────────────────────
export function ImageResize() {
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [mode, setMode] = useState<ResizeMode>('fit')
  const [noUpscale, setNoUpscale] = useState(true)
  const [format, setFormat] = useState<OutFormat>('auto')

  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageResize}
      showThumbnails
      actionLabel="Resize image"
      validate={() => (width === '' && height === '' ? 'Enter a width or a height.' : null)}
      controls={(files) => <ResizeFields
        file={files[0]}
        width={width}
        height={height}
        setWidth={setWidth}
        setHeight={setHeight}
        mode={mode}
        setMode={setMode}
        noUpscale={noUpscale}
        setNoUpscale={setNoUpscale}
        format={format}
        setFormat={setFormat}
      />}
      action={async (files) => {
        const file = files[0]
        const fmt = resolveFormat(format, file)
        const result = await processImage(file, {
          format: fmt,
          quality: 0.9,
          resize: {
            width: width === '' ? undefined : Number(width),
            height: height === '' ? undefined : Number(height),
            mode,
            noUpscale,
          },
        })
        return {
          blob: result.blob,
          filename: outputName(file.name, `${result.width}x${result.height}`, IMAGE_EXT[fmt]),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult blob={r.blob} filename={r.filename} originalSize={r.originalSize} kind="image" />
      )}
    />
  )
}

function ResizeFields({
  file,
  width,
  height,
  setWidth,
  setHeight,
  mode,
  setMode,
  noUpscale,
  setNoUpscale,
  format,
  setFormat,
}: {
  file: File
  width: number | ''
  height: number | ''
  setWidth: (v: number | '') => void
  setHeight: (v: number | '') => void
  mode: ResizeMode
  setMode: (v: ResizeMode) => void
  noUpscale: boolean
  setNoUpscale: (v: boolean) => void
  format: OutFormat
  setFormat: (v: OutFormat) => void
}) {
  const info = useMediaInfo(file, 'image')
  return (
    <div className="flex flex-col gap-5">
      {info.width > 0 && (
        <p className="text-xs text-slate-500">
          Original: {info.width} × {info.height} px
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Width">
          <NumberInput value={width} onChange={setWidth} suffix="px" placeholder="auto" />
        </Field>
        <Field label="Height">
          <NumberInput value={height} onChange={setHeight} suffix="px" placeholder="auto" />
        </Field>
      </div>
      <Field label="Fit mode" hint="Fit keeps aspect ratio; Cover crops to fill; Stretch distorts.">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'fit', label: 'Fit' },
            { value: 'cover', label: 'Cover' },
            { value: 'stretch', label: 'Stretch' },
          ]}
        />
      </Field>
      <div className="flex items-center justify-between">
        <Toggle checked={noUpscale} onChange={setNoUpscale} label="Don't enlarge beyond original" />
      </div>
      <Field label="Output format">
        <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
          {FORMAT_OPTIONS}
        </Select>
      </Field>
    </div>
  )
}

// ── Crop ────────────────────────────────────────────────────────────────────
type AspectKey = 'free' | '1:1' | '4:5' | '3:2' | '16:9' | '9:16'
const ASPECTS: Record<AspectKey, number | null> = {
  free: null,
  '1:1': 1,
  '4:5': 4 / 5,
  '3:2': 3 / 2,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
}
type Focus = 'center' | 'top' | 'bottom' | 'left' | 'right'

export function ImageCrop() {
  const [aspect, setAspect] = useState<AspectKey>('1:1')
  const [focus, setFocus] = useState<Focus>('center')

  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageCrop}
      showThumbnails
      actionLabel="Crop image"
      helpNote="Vormexa center-crops to the selected aspect ratio, keeping the chosen focus area."
      controls={(files) => <CropFields file={files[0]} aspect={aspect} setAspect={setAspect} focus={focus} setFocus={setFocus} />}
      action={async (files) => {
        const file = files[0]
        const fmt = resolveFormat('auto', file)
        const ratio = ASPECTS[aspect]
        const crop = ratio ? await computeCenterCrop(file, ratio, focus) : undefined
        const result = await processImage(file, { format: fmt, quality: 0.92, crop })
        return {
          blob: result.blob,
          filename: outputName(file.name, 'cropped', IMAGE_EXT[fmt]),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult blob={r.blob} filename={r.filename} originalSize={r.originalSize} kind="image" />
      )}
    />
  )
}

function CropFields({
  file,
  aspect,
  setAspect,
  focus,
  setFocus,
}: {
  file: File
  aspect: AspectKey
  setAspect: (v: AspectKey) => void
  focus: Focus
  setFocus: (v: Focus) => void
}) {
  const info = useMediaInfo(file, 'image')
  return (
    <div className="flex flex-col gap-5">
      {info.width > 0 && (
        <p className="text-xs text-slate-500">
          Original: {info.width} × {info.height} px
        </p>
      )}
      <Field label="Aspect ratio">
        <Segmented
          value={aspect}
          onChange={setAspect}
          options={(Object.keys(ASPECTS) as AspectKey[]).map((k) => ({ value: k, label: k }))}
        />
      </Field>
      {aspect !== 'free' && (
        <Field label="Focus">
          <Segmented
            value={focus}
            onChange={setFocus}
            options={[
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Field>
      )}
    </div>
  )
}

async function computeCenterCrop(file: File, ratio: number, focus: Focus) {
  const { probeImage } = await import('@/lib/probe')
  const { width, height } = await probeImage(file)
  let cw = width
  let ch = Math.round(width / ratio)
  if (ch > height) {
    ch = height
    cw = Math.round(height * ratio)
  }
  let x = Math.round((width - cw) / 2)
  let y = Math.round((height - ch) / 2)
  if (focus === 'top') y = 0
  if (focus === 'bottom') y = height - ch
  if (focus === 'left') x = 0
  if (focus === 'right') x = width - cw
  return { x, y, width: cw, height: ch }
}

// ── Rotate & flip ───────────────────────────────────────────────────────────
export function ImageRotate() {
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(90)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageRotate}
      showThumbnails
      actionLabel="Apply"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Rotate">
            <Segmented
              value={String(rotate)}
              onChange={(v) => setRotate(Number(v) as 0 | 90 | 180 | 270)}
              options={[
                { value: '0', label: '0°' },
                { value: '90', label: '90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
              ]}
            />
          </Field>
          <div className="flex flex-wrap gap-6">
            <Toggle checked={flipH} onChange={setFlipH} label="Flip horizontal" />
            <Toggle checked={flipV} onChange={setFlipV} label="Flip vertical" />
          </div>
        </div>
      )}
      action={async (files) => {
        const file = files[0]
        const fmt = resolveFormat('auto', file)
        const result = await processImage(file, { format: fmt, quality: 0.92, rotate, flipH, flipV })
        return {
          blob: result.blob,
          filename: outputName(file.name, 'rotated', IMAGE_EXT[fmt]),
          originalSize: file.size,
        }
      }}
      renderResult={(r) => (
        <SingleResult blob={r.blob} filename={r.filename} originalSize={r.originalSize} kind="image" />
      )}
    />
  )
}

// ── Merge / collage ───────────────────────────────────────────────────────────
export function ImageMerge() {
  const [layout, setLayout] = useState<CollageLayout>('grid')
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState(12)
  const [format, setFormat] = useState<ImageFormat>('jpeg')

  return (
    <ToolFrame<ImgResult>
      meta={TOOLS.imageMerge}
      minFiles={2}
      reorderable
      showThumbnails
      proAboveCount={FREE_BATCH_LIMIT}
      actionLabel="Merge images"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Layout">
            <Segmented
              value={layout}
              onChange={setLayout}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'horizontal', label: 'Row' },
                { value: 'vertical', label: 'Column' },
              ]}
            />
          </Field>
          {layout === 'grid' && (
            <Field label={`Columns · ${columns}`}>
              <Slider min={1} max={6} value={columns} onChange={(v) => setColumns(Math.round(v))} />
            </Field>
          )}
          <Field label={`Spacing · ${gap}px`}>
            <Slider min={0} max={48} value={gap} onChange={(v) => setGap(Math.round(v))} />
          </Field>
          <Field label="Output format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as ImageFormat)}>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </Select>
          </Field>
        </div>
      )}
      action={async (files) => {
        const result = await createCollage(files, { layout, columns, gap, format, quality: 0.88 })
        return {
          blob: result.blob,
          filename: `vormexa-collage.${IMAGE_EXT[format]}`,
          originalSize: files.reduce((n, f) => n + f.size, 0),
        }
      }}
      renderResult={(r) => <SingleResult blob={r.blob} filename={r.filename} kind="image" />}
    />
  )
}
