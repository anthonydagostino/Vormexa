import { lazy, type LazyExoticComponent, type ComponentType } from 'react'
import type { ToolKey } from './registry-meta'

/**
 * Lazy component loaders keyed by tool. Each tool category lives in its own
 * module, so navigating to a tool code-splits its (heavy) engine deps —
 * ffmpeg.wasm, pdf-lib, pdf.js — out of the marketing bundle entirely.
 */
const video = () => import('@/components/tools/video-tools')
const image = () => import('@/components/tools/image-tools')
const audio = () => import('@/components/tools/audio-tools')
const pdf = () => import('@/components/tools/pdf-tools')

export const LAZY_TOOLS: Record<ToolKey, LazyExoticComponent<ComponentType>> = {
  videoCompress: lazy(() => video().then((m) => ({ default: m.VideoCompress }))),
  videoConvert: lazy(() => video().then((m) => ({ default: m.VideoConvert }))),
  videoResize: lazy(() => video().then((m) => ({ default: m.VideoResize }))),
  videoTrim: lazy(() => video().then((m) => ({ default: m.VideoTrim }))),
  videoMerge: lazy(() => video().then((m) => ({ default: m.VideoMerge }))),
  videoExtractAudio: lazy(() => video().then((m) => ({ default: m.VideoExtractAudio }))),
  videoToGif: lazy(() => video().then((m) => ({ default: m.VideoToGif }))),

  imageCompress: lazy(() => image().then((m) => ({ default: m.ImageCompress }))),
  imageConvert: lazy(() => image().then((m) => ({ default: m.ImageConvert }))),
  imageResize: lazy(() => image().then((m) => ({ default: m.ImageResize }))),
  imageCrop: lazy(() => image().then((m) => ({ default: m.ImageCrop }))),
  imageRotate: lazy(() => image().then((m) => ({ default: m.ImageRotate }))),
  imageMerge: lazy(() => image().then((m) => ({ default: m.ImageMerge }))),

  audioConvert: lazy(() => audio().then((m) => ({ default: m.AudioConvert }))),
  audioCompress: lazy(() => audio().then((m) => ({ default: m.AudioCompress }))),
  audioTrim: lazy(() => audio().then((m) => ({ default: m.AudioTrim }))),
  audioMerge: lazy(() => audio().then((m) => ({ default: m.AudioMerge }))),

  pdfMerge: lazy(() => pdf().then((m) => ({ default: m.PdfMerge }))),
  pdfSplit: lazy(() => pdf().then((m) => ({ default: m.PdfSplit }))),
  imagesToPdf: lazy(() => pdf().then((m) => ({ default: m.ImagesToPdf }))),
  pdfToImages: lazy(() => pdf().then((m) => ({ default: m.PdfToImages }))),
  pdfCompress: lazy(() => pdf().then((m) => ({ default: m.PdfCompress }))),
  pdfRotate: lazy(() => pdf().then((m) => ({ default: m.PdfRotate }))),
}
