import {
  AudioLines,
  Combine,
  Crop,
  FileDown,
  FileImage,
  FileText,
  Film,
  Image as ImageIcon,
  Images,
  Music,
  RefreshCw,
  RotateCw,
  Scaling,
  Scissors,
  Shrink,
  Video,
} from 'lucide-react'
import type { CategoryId, CategoryMeta, ToolMeta } from './types'

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    blurb: 'Compress, convert, resize, trim & merge video.',
    gradient: 'from-rose-500/20 to-orange-500/10',
    accent: 'text-rose-300',
  },
  {
    id: 'image',
    label: 'Photo',
    icon: ImageIcon,
    blurb: 'Compress, convert, resize, crop & combine images.',
    gradient: 'from-brand-500/20 to-accent-500/10',
    accent: 'text-brand-300',
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: Music,
    blurb: 'Convert, compress, trim & merge audio tracks.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    accent: 'text-emerald-300',
  },
  {
    id: 'pdf',
    label: 'PDF',
    icon: FileText,
    blurb: 'Merge, split, compress & convert PDFs and images.',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    accent: 'text-amber-300',
  },
]

const ACCEPT = {
  video: 'video/*',
  image: 'image/*',
  audio: 'audio/*',
  pdf: 'application/pdf,.pdf',
}

/**
 * Metadata for every tool, keyed for direct reference from components.
 * Kept free of React component imports so tool modules can read their own
 * metadata without a circular dependency.
 */
export const TOOLS = {
  // ── Video ──
  videoCompress: {
    slug: 'compress',
    category: 'video',
    title: 'Compress Video',
    short: 'Shrink video size',
    description: 'Reduce video file size with adjustable quality — great for sharing and uploads.',
    icon: Shrink,
    keywords: ['reduce', 'smaller', 'size', 'mp4', 'bitrate'],
    accept: ACCEPT.video,
    multiple: false,
  },
  videoConvert: {
    slug: 'convert',
    category: 'video',
    title: 'Convert Video',
    short: 'Change video format',
    description: 'Convert between MP4, WebM, MKV, MOV and animated GIF.',
    icon: RefreshCw,
    keywords: ['mp4', 'webm', 'mov', 'mkv', 'gif', 'format'],
    accept: ACCEPT.video,
    multiple: false,
  },
  videoResize: {
    slug: 'resize',
    category: 'video',
    title: 'Resize Video',
    short: 'Change resolution',
    description: 'Scale video to a new resolution — 1080p, 720p, vertical, or custom.',
    icon: Scaling,
    keywords: ['resolution', 'scale', '1080', '720', 'dimensions'],
    accept: ACCEPT.video,
    multiple: false,
  },
  videoTrim: {
    slug: 'trim',
    category: 'video',
    title: 'Trim Video',
    short: 'Cut start & end',
    description: 'Trim a clip to just the part you need with a precise time selection.',
    icon: Scissors,
    keywords: ['cut', 'clip', 'crop time', 'shorten'],
    accept: ACCEPT.video,
    multiple: false,
  },
  videoMerge: {
    slug: 'merge',
    category: 'video',
    title: 'Merge Videos',
    short: 'Join clips together',
    description: 'Stitch multiple clips into one video, in the order you choose.',
    icon: Combine,
    keywords: ['join', 'combine', 'concat', 'stitch'],
    accept: ACCEPT.video,
    multiple: true,
  },
  videoExtractAudio: {
    slug: 'extract-audio',
    category: 'video',
    title: 'Extract Audio',
    short: 'Video → audio',
    description: 'Pull the soundtrack out of a video as MP3, M4A or WAV.',
    icon: AudioLines,
    keywords: ['rip', 'sound', 'mp3', 'soundtrack', 'audio'],
    accept: ACCEPT.video,
    multiple: false,
  },
  videoToGif: {
    slug: 'to-gif',
    category: 'video',
    title: 'Video to GIF',
    short: 'Make an animated GIF',
    description: 'Turn a clip into a high-quality looping animated GIF.',
    icon: Film,
    keywords: ['gif', 'animation', 'loop', 'meme'],
    accept: ACCEPT.video,
    multiple: false,
  },

  // ── Image ──
  imageCompress: {
    slug: 'compress',
    category: 'image',
    title: 'Compress Image',
    short: 'Shrink photo size',
    description: 'Reduce image file size by quality or to a target size, without visible loss.',
    icon: Shrink,
    keywords: ['reduce', 'optimize', 'jpg', 'png', 'smaller'],
    accept: ACCEPT.image,
    multiple: false,
  },
  imageConvert: {
    slug: 'convert',
    category: 'image',
    title: 'Convert Image',
    short: 'Change photo format',
    description: 'Convert between JPG, PNG and WebP in a single click.',
    icon: RefreshCw,
    keywords: ['jpg', 'jpeg', 'png', 'webp', 'format'],
    accept: ACCEPT.image,
    multiple: false,
  },
  imageResize: {
    slug: 'resize',
    category: 'image',
    title: 'Resize Image',
    short: 'Change dimensions',
    description: 'Resize photos to exact dimensions with fit, cover or stretch modes.',
    icon: Scaling,
    keywords: ['scale', 'dimensions', 'width', 'height', 'pixels'],
    accept: ACCEPT.image,
    multiple: false,
  },
  imageCrop: {
    slug: 'crop',
    category: 'image',
    title: 'Crop Image',
    short: 'Crop to aspect ratio',
    description: 'Crop to popular aspect ratios like 1:1, 4:5 and 16:9 with a chosen focus.',
    icon: Crop,
    keywords: ['aspect', 'square', 'instagram', 'trim edges'],
    accept: ACCEPT.image,
    multiple: false,
  },
  imageRotate: {
    slug: 'rotate',
    category: 'image',
    title: 'Rotate & Flip',
    short: 'Rotate or mirror',
    description: 'Rotate by 90° increments and flip images horizontally or vertically.',
    icon: RotateCw,
    keywords: ['rotate', 'flip', 'mirror', 'orientation'],
    accept: ACCEPT.image,
    multiple: false,
  },
  imageMerge: {
    slug: 'merge',
    category: 'image',
    title: 'Merge Images',
    short: 'Collage & combine',
    description: 'Combine several images into one collage — grid, row or column.',
    icon: Images,
    keywords: ['collage', 'combine', 'grid', 'contact sheet'],
    accept: ACCEPT.image,
    multiple: true,
  },

  // ── Audio ──
  audioConvert: {
    slug: 'convert',
    category: 'audio',
    title: 'Convert Audio',
    short: 'Change audio format',
    description: 'Convert between MP3, M4A, WAV, OGG and FLAC.',
    icon: RefreshCw,
    keywords: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'format'],
    accept: ACCEPT.audio,
    multiple: false,
  },
  audioCompress: {
    slug: 'compress',
    category: 'audio',
    title: 'Compress Audio',
    short: 'Shrink audio size',
    description: 'Lower the bitrate to shrink audio files for sharing or storage.',
    icon: Shrink,
    keywords: ['bitrate', 'reduce', 'smaller', 'size'],
    accept: ACCEPT.audio,
    multiple: false,
  },
  audioTrim: {
    slug: 'trim',
    category: 'audio',
    title: 'Trim Audio',
    short: 'Cut a section',
    description: 'Cut audio to a precise start and end — perfect for ringtones and clips.',
    icon: Scissors,
    keywords: ['cut', 'clip', 'ringtone', 'shorten'],
    accept: ACCEPT.audio,
    multiple: false,
  },
  audioMerge: {
    slug: 'merge',
    category: 'audio',
    title: 'Merge Audio',
    short: 'Join tracks',
    description: 'Join multiple audio tracks end-to-end into a single file.',
    icon: Combine,
    keywords: ['join', 'combine', 'concat', 'playlist'],
    accept: ACCEPT.audio,
    multiple: true,
  },

  // ── PDF ──
  pdfMerge: {
    slug: 'merge',
    category: 'pdf',
    title: 'Merge PDF',
    short: 'Combine PDFs',
    description: 'Combine multiple PDF files into one, in the order you arrange them.',
    icon: Combine,
    keywords: ['combine', 'join', 'append', 'documents'],
    accept: ACCEPT.pdf,
    multiple: true,
  },
  pdfSplit: {
    slug: 'split',
    category: 'pdf',
    title: 'Split PDF',
    short: 'Extract pages',
    description: 'Split a PDF into single pages or extract a specific page range.',
    icon: Scissors,
    keywords: ['extract', 'pages', 'separate', 'divide'],
    accept: ACCEPT.pdf,
    multiple: false,
  },
  imagesToPdf: {
    slug: 'images-to-pdf',
    category: 'pdf',
    title: 'Images to PDF',
    short: 'Photos → PDF',
    description: 'Turn JPG, PNG or WebP images into a single PDF document.',
    icon: FileImage,
    keywords: ['jpg', 'png', 'convert', 'document', 'combine'],
    accept: ACCEPT.image,
    multiple: true,
  },
  pdfToImages: {
    slug: 'to-images',
    category: 'pdf',
    title: 'PDF to Images',
    short: 'PDF → photos',
    description: 'Render each page of a PDF to a high-quality JPG or PNG image.',
    icon: Images,
    keywords: ['export', 'jpg', 'png', 'pages', 'render'],
    accept: ACCEPT.pdf,
    multiple: false,
  },
  pdfCompress: {
    slug: 'compress',
    category: 'pdf',
    title: 'Compress PDF',
    short: 'Shrink PDF size',
    description: 'Reduce PDF size by optimizing pages — ideal for scans and image-heavy files.',
    icon: FileDown,
    keywords: ['reduce', 'smaller', 'optimize', 'scan'],
    accept: ACCEPT.pdf,
    multiple: false,
  },
  pdfRotate: {
    slug: 'rotate',
    category: 'pdf',
    title: 'Rotate PDF',
    short: 'Rotate pages',
    description: 'Rotate every page of a PDF by 90°, 180° or 270°.',
    icon: RotateCw,
    keywords: ['rotate', 'orientation', 'landscape', 'portrait'],
    accept: ACCEPT.pdf,
    multiple: false,
  },
} satisfies Record<string, ToolMeta>

export type ToolKey = keyof typeof TOOLS

/** All tools as a flat list (metadata only — no React components). */
export const ALL_TOOLS: ToolMeta[] = Object.values(TOOLS)

const KEY_BY_PATH = new Map<string, ToolKey>(
  (Object.keys(TOOLS) as ToolKey[]).map((k) => [`${TOOLS[k].category}/${TOOLS[k].slug}`, k]),
)

export function toolKey(category: string, slug: string): ToolKey | undefined {
  return KEY_BY_PATH.get(`${category}/${slug}`)
}

export function getToolMeta(category: string, slug: string): ToolMeta | undefined {
  const key = toolKey(category, slug)
  return key ? TOOLS[key] : undefined
}

export function toolsByCategory(category: CategoryId): ToolMeta[] {
  return ALL_TOOLS.filter((t) => t.category === category)
}

export function searchTools(query: string): ToolMeta[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALL_TOOLS
  return ALL_TOOLS.filter((t) =>
    [t.title, t.short, t.description, t.category, ...t.keywords]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}
