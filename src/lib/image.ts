/** Client-side image processing via Canvas — no uploads, no dependencies. */

export type ImageFormat = 'jpeg' | 'png' | 'webp'

export const IMAGE_MIME: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const IMAGE_EXT: Record<ImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Unsupported image format'))
      img.src = url
    })
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function dims(src: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  if ('width' in src && 'height' in src) {
    const w = (src as ImageBitmap).width || (src as HTMLImageElement).naturalWidth
    const h = (src as ImageBitmap).height || (src as HTMLImageElement).naturalHeight
    return { w, h }
  }
  return { w: 0, h: 0 }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encoding failed'))),
      IMAGE_MIME[format],
      format === 'png' ? undefined : quality,
    )
  })
}

export type ResizeMode = 'fit' | 'cover' | 'stretch'

export interface ResizeOptions {
  width?: number
  height?: number
  mode?: ResizeMode
  /** Never upscale beyond the source resolution. */
  noUpscale?: boolean
}

export interface EncodeOptions {
  format: ImageFormat
  /** 0–1. Ignored for png. */
  quality?: number
  /** Background used when flattening transparency into jpeg. */
  background?: string
}

/** Compute target dimensions honoring the requested resize mode. Exported for testing. */
export function computeSize(
  srcW: number,
  srcH: number,
  opt: ResizeOptions,
): { w: number; h: number; drawW: number; drawH: number; dx: number; dy: number } {
  let targetW = opt.width || 0
  let targetH = opt.height || 0
  const mode = opt.mode ?? 'fit'

  if (!targetW && !targetH) {
    targetW = srcW
    targetH = srcH
  } else if (!targetW) {
    targetW = Math.round((srcW / srcH) * targetH)
  } else if (!targetH) {
    targetH = Math.round((srcH / srcW) * targetW)
  }

  if (opt.noUpscale) {
    if (targetW > srcW) {
      targetW = srcW
      if (opt.height && !opt.width) targetH = srcH
    }
    if (targetH > srcH && !(opt.width && opt.height)) targetH = srcH
  }

  if (mode === 'stretch') {
    return { w: targetW, h: targetH, drawW: targetW, drawH: targetH, dx: 0, dy: 0 }
  }

  const scale =
    mode === 'cover'
      ? Math.max(targetW / srcW, targetH / srcH)
      : Math.min(targetW / srcW, targetH / srcH)
  const drawW = Math.round(srcW * scale)
  const drawH = Math.round(srcH * scale)

  if (mode === 'fit') {
    // Canvas shrinks to the drawn image (no letterboxing).
    return { w: drawW, h: drawH, drawW, drawH, dx: 0, dy: 0 }
  }
  // cover: crop to exact target box.
  return {
    w: targetW,
    h: targetH,
    drawW,
    drawH,
    dx: Math.round((targetW - drawW) / 2),
    dy: Math.round((targetH - drawH) / 2),
  }
}

export interface ProcessImageOptions extends EncodeOptions {
  resize?: ResizeOptions
  rotate?: 0 | 90 | 180 | 270
  flipH?: boolean
  flipV?: boolean
  crop?: { x: number; y: number; width: number; height: number }
}

export interface ImageResult {
  blob: Blob
  width: number
  height: number
}

export async function processImage(file: Blob, opt: ProcessImageOptions): Promise<ImageResult> {
  const src = await decode(file)
  const { w: srcW, h: srcH } = dims(src)

  // Optional crop first (in source pixel space).
  let stageCanvas: HTMLCanvasElement
  let stageW = srcW
  let stageH = srcH
  if (opt.crop) {
    const c = opt.crop
    stageW = Math.max(1, Math.round(c.width))
    stageH = Math.max(1, Math.round(c.height))
    stageCanvas = document.createElement('canvas')
    stageCanvas.width = stageW
    stageCanvas.height = stageH
    const cx = stageCanvas.getContext('2d')!
    cx.drawImage(src, c.x, c.y, c.width, c.height, 0, 0, stageW, stageH)
  } else {
    stageCanvas = document.createElement('canvas')
    stageCanvas.width = stageW
    stageCanvas.height = stageH
    stageCanvas.getContext('2d')!.drawImage(src, 0, 0)
  }

  // Resize.
  const size = computeSize(stageW, stageH, opt.resize ?? {})
  const rotated = opt.rotate === 90 || opt.rotate === 270
  const outW = rotated ? size.h : size.w
  const outH = rotated ? size.w : size.h

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'

  // jpeg has no alpha — flatten onto a background.
  if (opt.format === 'jpeg') {
    ctx.fillStyle = opt.background ?? '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
  }

  ctx.save()
  ctx.translate(outW / 2, outH / 2)
  if (opt.rotate) ctx.rotate((opt.rotate * Math.PI) / 180)
  ctx.scale(opt.flipH ? -1 : 1, opt.flipV ? -1 : 1)
  ctx.drawImage(stageCanvas, size.dx - size.w / 2, size.dy - size.h / 2, size.drawW, size.drawH)
  ctx.restore()

  const quality = opt.quality ?? 0.82
  const blob = await canvasToBlob(canvas, opt.format, quality)
  return { blob, width: outW, height: outH }
}

/**
 * Iteratively lower quality until the output is <= targetBytes (best-effort).
 * Returns the smallest acceptable encoding, or the lowest-quality attempt.
 */
export async function compressToTarget(
  file: Blob,
  format: ImageFormat,
  targetBytes: number,
  resize?: ResizeOptions,
): Promise<ImageResult> {
  let low = 0.3
  let high = 0.95
  let best: ImageResult | null = null

  for (let i = 0; i < 7; i++) {
    const q = (low + high) / 2
    const result = await processImage(file, { format, quality: q, resize })
    if (result.blob.size <= targetBytes) {
      best = result
      low = q // try higher quality
    } else {
      high = q // need smaller
    }
  }
  if (best) return best
  return processImage(file, { format, quality: 0.3, resize })
}

export type CollageLayout = 'grid' | 'horizontal' | 'vertical'

export interface CollageOptions {
  layout: CollageLayout
  columns?: number
  gap?: number
  background?: string
  cellSize?: number
  format?: ImageFormat
  quality?: number
}

/** Merge several images into a single collage / contact sheet. */
export async function createCollage(files: Blob[], opt: CollageOptions): Promise<ImageResult> {
  const bitmaps = await Promise.all(files.map((f) => decode(f)))
  const cell = opt.cellSize ?? 512
  const gap = opt.gap ?? 12
  const bg = opt.background ?? '#ffffff'
  const n = bitmaps.length

  let cols: number
  let rows: number
  if (opt.layout === 'horizontal') {
    cols = n
    rows = 1
  } else if (opt.layout === 'vertical') {
    cols = 1
    rows = n
  } else {
    cols = opt.columns ?? Math.ceil(Math.sqrt(n))
    rows = Math.ceil(n / cols)
  }

  const width = cols * cell + (cols + 1) * gap
  const height = rows * cell + (rows + 1) * gap
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  bitmaps.forEach((bmp, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x0 = gap + col * (cell + gap)
    const y0 = gap + row * (cell + gap)
    const { w, h } = dims(bmp)
    const scale = Math.min(cell / w, cell / h)
    const dw = w * scale
    const dh = h * scale
    ctx.drawImage(bmp, x0 + (cell - dw) / 2, y0 + (cell - dh) / 2, dw, dh)
  })

  const format = opt.format ?? 'jpeg'
  const blob = await canvasToBlob(canvas, format, opt.quality ?? 0.85)
  return { blob, width, height }
}

/** Decode + re-encode a single frame to a data URL (for previews). */
export async function toPreviewUrl(file: Blob, maxSize = 320): Promise<string> {
  const result = await processImage(file, {
    format: 'jpeg',
    quality: 0.7,
    resize: { width: maxSize, height: maxSize, mode: 'fit', noUpscale: true },
  })
  return URL.createObjectURL(result.blob)
}
