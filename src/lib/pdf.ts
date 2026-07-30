import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
// Vite resolves this to a hashed, self-hosted worker URL (stays offline).
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { RunProgress } from './ffmpeg'
import { processImage, type ImageFormat } from './image'

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker

/** PDF operations via pdf-lib (writing) + pdf.js (rendering). On-device only. */

export interface PdfJob {
  onProgress?: RunProgress
  signal?: AbortSignal
}

function checkAbort(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
}

/** Merge several PDFs into one, in the given order. */
export async function mergePdfs(files: File[], job: PdfJob = {}): Promise<Blob> {
  const out = await PDFDocument.create()
  let i = 0
  for (const file of files) {
    checkAbort(job.signal)
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
    i++
    job.onProgress?.(i / files.length)
  }
  const bytes = await out.save()
  return new Blob([toBuffer(bytes)], { type: 'application/pdf' })
}

/** Parse a page-range string like "1-3, 5, 8-10" into zero-based indices. */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const result = new Set<number>()
  for (const part of input.split(',')) {
    const token = part.trim()
    if (!token) continue
    const range = token.split('-').map((s) => parseInt(s.trim(), 10))
    if (range.length === 1 && Number.isFinite(range[0])) {
      const p = range[0]
      if (p >= 1 && p <= pageCount) result.add(p - 1)
    } else if (range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1])) {
      const [a, b] = [Math.min(...range), Math.max(...range)]
      for (let p = a; p <= b; p++) if (p >= 1 && p <= pageCount) result.add(p - 1)
    }
  }
  return [...result].sort((x, y) => x - y)
}

export async function getPdfPageCount(file: File): Promise<number> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  return doc.getPageCount()
}

/** Extract a subset of pages into a new PDF. */
export async function extractPages(file: File, indices: number[], job: PdfJob = {}): Promise<Blob> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, indices)
  copied.forEach((p, i) => {
    out.addPage(p)
    job.onProgress?.((i + 1) / indices.length)
  })
  const bytes = await out.save()
  return new Blob([toBuffer(bytes)], { type: 'application/pdf' })
}

/** Split a PDF into one single-page PDF per page. */
export async function splitToPages(
  file: File,
  job: PdfJob = {},
): Promise<{ name: string; blob: Blob }[]> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const count = src.getPageCount()
  const results: { name: string; blob: Blob }[] = []
  for (let i = 0; i < count; i++) {
    checkAbort(job.signal)
    const out = await PDFDocument.create()
    const [page] = await out.copyPages(src, [i])
    out.addPage(page)
    const bytes = await out.save()
    results.push({
      name: `page-${String(i + 1).padStart(3, '0')}.pdf`,
      blob: new Blob([toBuffer(bytes)], { type: 'application/pdf' }),
    })
    job.onProgress?.((i + 1) / count)
  }
  return results
}

export type PageSize = 'fit' | 'a4' | 'letter'

const PAGE_DIMS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

export interface ImagesToPdfOptions extends PdfJob {
  pageSize?: PageSize
  margin?: number
  orientation?: 'auto' | 'portrait' | 'landscape'
}

/** Combine images into a single PDF, one image per page. */
export async function imagesToPdf(files: File[], opt: ImagesToPdfOptions = {}): Promise<Blob> {
  const pageSize = opt.pageSize ?? 'fit'
  const margin = opt.margin ?? 0
  const doc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    checkAbort(opt.signal)
    const file = files[i]
    const bytes = new Uint8Array(await file.arrayBuffer())
    const isPng = /\.png$/i.test(file.name) || file.type === 'image/png'

    let embedded
    if (isPng) {
      embedded = await doc.embedPng(bytes)
    } else if (/\.(jpe?g)$/i.test(file.name) || file.type === 'image/jpeg') {
      embedded = await doc.embedJpg(bytes)
    } else {
      // Re-encode webp/other into JPEG so pdf-lib can embed it.
      const conv = await processImage(file, { format: 'jpeg', quality: 0.92 })
      embedded = await doc.embedJpg(new Uint8Array(await conv.blob.arrayBuffer()))
    }

    const imgW = embedded.width
    const imgH = embedded.height

    if (pageSize === 'fit') {
      const page = doc.addPage([imgW + margin * 2, imgH + margin * 2])
      page.drawImage(embedded, { x: margin, y: margin, width: imgW, height: imgH })
    } else {
      let [pw, ph] = PAGE_DIMS[pageSize]
      const landscape =
        opt.orientation === 'landscape' || (opt.orientation === 'auto' && imgW > imgH)
      if (landscape) [pw, ph] = [ph, pw]
      const page = doc.addPage([pw, ph])
      const availW = pw - margin * 2
      const availH = ph - margin * 2
      const scale = Math.min(availW / imgW, availH / imgH)
      const dw = imgW * scale
      const dh = imgH * scale
      page.drawImage(embedded, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh })
    }
    opt.onProgress?.((i + 1) / files.length)
  }

  const out = await doc.save()
  return new Blob([toBuffer(out)], { type: 'application/pdf' })
}

export interface PdfToImagesOptions extends PdfJob {
  format?: ImageFormat
  /** Render scale — higher = sharper & larger (2 ≈ 144dpi). */
  scale?: number
  quality?: number
  pages?: number[]
}

/** Render each PDF page to an image using pdf.js. */
export async function pdfToImages(
  file: File,
  opt: PdfToImagesOptions = {},
): Promise<{ name: string; blob: Blob }[]> {
  const format = opt.format ?? 'jpeg'
  const scale = opt.scale ?? 2
  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data }).promise
  const total = doc.numPages
  const wanted = opt.pages && opt.pages.length ? opt.pages : range(1, total)
  const results: { name: string; blob: Blob }[] = []

  for (let idx = 0; idx < wanted.length; idx++) {
    checkAbort(opt.signal)
    const pageNum = wanted[idx]
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')!
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    await page.render({ canvasContext: ctx, viewport }).promise
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('render failed'))),
        format === 'png' ? 'image/png' : 'image/jpeg',
        opt.quality ?? 0.9,
      ),
    )
    results.push({
      name: `page-${String(pageNum).padStart(3, '0')}.${format === 'png' ? 'png' : 'jpg'}`,
      blob,
    })
    opt.onProgress?.((idx + 1) / wanted.length)
  }
  await doc.destroy()
  return results
}

export interface CompressPdfOptions extends PdfJob {
  /** 0–1 JPEG quality for the rasterized pages. */
  quality?: number
  /** Render scale — lower shrinks output further. 1.5 ≈ 108dpi. */
  scale?: number
}

/**
 * Compress a PDF by rasterizing each page to a JPEG at a controlled quality
 * and rebuilding the document. Very effective for scanned / image-heavy PDFs.
 */
export async function compressPdf(file: File, opt: CompressPdfOptions = {}): Promise<Blob> {
  const quality = opt.quality ?? 0.6
  const scale = opt.scale ?? 1.5
  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data }).promise
  const out = await PDFDocument.create()
  const total = doc.numPages

  for (let pageNum = 1; pageNum <= total; pageNum++) {
    checkAbort(opt.signal)
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise

    const jpegBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality),
    )
    const embedded = await out.embedJpg(new Uint8Array(await jpegBlob.arrayBuffer()))
    const p = out.addPage([viewport.width, viewport.height])
    p.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height })
    opt.onProgress?.(pageNum / total)
  }
  await doc.destroy()
  const bytes = await out.save()
  return new Blob([toBuffer(bytes)], { type: 'application/pdf' })
}

/** Rotate every page (or a subset) by a multiple of 90°. */
export async function rotatePdf(
  file: File,
  angle: 90 | 180 | 270,
  job: PdfJob = {},
): Promise<Blob> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const current = page.getRotation().angle
    page.setRotation(degrees((current + angle) % 360))
    job.onProgress?.((i + 1) / pages.length)
  })
  const bytes = await doc.save()
  return new Blob([toBuffer(bytes)], { type: 'application/pdf' })
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function toBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  return copy.buffer
}
