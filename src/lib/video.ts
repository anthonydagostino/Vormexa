import { runFFmpeg, vfsName, type RunProgress } from './ffmpeg'
import { getExtension } from './format'

/** Video operations. All encoding happens on-device via ffmpeg.wasm. */

export interface Job {
  onProgress?: RunProgress
  signal?: AbortSignal
}

export type VideoContainer = 'mp4' | 'webm' | 'mkv' | 'mov' | 'gif'

export const VIDEO_CONTAINERS: { value: VideoContainer; label: string }[] = [
  { value: 'mp4', label: 'MP4 (H.264 + AAC)' },
  { value: 'webm', label: 'WebM (VP8 + Vorbis)' },
  { value: 'mkv', label: 'MKV (H.264)' },
  { value: 'mov', label: 'MOV (H.264)' },
  { value: 'gif', label: 'Animated GIF' },
]

function codecArgs(container: VideoContainer, crf: number): string[] {
  switch (container) {
    case 'webm':
      return ['-c:v', 'libvpx', '-b:v', '0', '-crf', String(crf), '-c:a', 'libvorbis']
    case 'gif':
      return [] // handled separately
    case 'mp4':
    case 'mov':
    case 'mkv':
    default:
      return [
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        String(crf),
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        ...(container === 'mp4' || container === 'mov' ? ['-movflags', '+faststart'] : []),
      ]
  }
}

export type CompressLevel = 'light' | 'balanced' | 'strong' | 'extreme'

const CRF_BY_LEVEL: Record<CompressLevel, number> = {
  light: 22,
  balanced: 27,
  strong: 32,
  extreme: 36,
}

export interface CompressOptions extends Job {
  level: CompressLevel
  container?: Extract<VideoContainer, 'mp4' | 'webm' | 'mkv'>
  /** Optionally cap the longest edge (e.g. 1080). */
  maxHeight?: number
  durationSec?: number
}

export async function compressVideo(file: File, opt: CompressOptions): Promise<Blob> {
  const container = opt.container ?? 'mp4'
  const crf = CRF_BY_LEVEL[opt.level]
  const input = vfsName(file.name)
  const output = `out.${container}`
  const filters: string[] = []
  if (opt.maxHeight) filters.push(`scale=-2:'min(${opt.maxHeight},ih)'`)

  const args = [
    '-i',
    input,
    ...(filters.length ? ['-vf', filters.join(',')] : []),
    ...codecArgs(container, crf),
    output,
  ]

  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: mimeForContainer(container) })
}

export interface ConvertOptions extends Job {
  container: VideoContainer
  crf?: number
  fps?: number
  durationSec?: number
}

export async function convertVideo(file: File, opt: ConvertOptions): Promise<Blob> {
  const input = vfsName(file.name)

  if (opt.container === 'gif') {
    return toGif(file, { fps: opt.fps ?? 12, ...opt })
  }

  const output = `out.${opt.container}`
  const args = [
    '-i',
    input,
    ...(opt.fps ? ['-r', String(opt.fps)] : []),
    ...codecArgs(opt.container, opt.crf ?? 25),
    output,
  ]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: mimeForContainer(opt.container) })
}

export interface ResizeVideoOptions extends Job {
  width?: number
  height?: number
  container?: Extract<VideoContainer, 'mp4' | 'webm' | 'mkv'>
  durationSec?: number
}

export async function resizeVideo(file: File, opt: ResizeVideoOptions): Promise<Blob> {
  const container = opt.container ?? 'mp4'
  const input = vfsName(file.name)
  const output = `out.${container}`
  const w = opt.width ? opt.width : -2
  const h = opt.height ? opt.height : -2
  const scale = `scale=${w}:${h}`

  const args = ['-i', input, '-vf', scale, ...codecArgs(container, 23), output]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: mimeForContainer(container) })
}

export interface TrimOptions extends Job {
  start: number
  end: number
  reEncode?: boolean
  durationSec?: number
}

export async function trimVideo(file: File, opt: TrimOptions): Promise<Blob> {
  const ext = getExtension(file.name) || 'mp4'
  const input = vfsName(file.name)
  const output = `out.${ext}`
  const dur = Math.max(0, opt.end - opt.start)

  // Stream copy when possible (fast, lossless); re-encode for frame accuracy.
  const args = opt.reEncode
    ? ['-ss', String(opt.start), '-i', input, '-t', String(dur), ...codecArgs('mp4', 23), output]
    : ['-ss', String(opt.start), '-i', input, '-t', String(dur), '-c', 'copy', output]

  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: dur,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], {
    type: mimeForContainer(ext as VideoContainer),
  })
}

export interface MergeOptions extends Job {
  durationSec?: number
}

/**
 * Concatenate multiple clips. Sources may differ in size/codec, so we
 * normalize each to a common format via the concat filter and re-encode.
 */
export async function mergeVideos(files: File[], opt: MergeOptions = {}): Promise<Blob> {
  const inputs = files.map((f) => ({ name: vfsName(f.name), file: f }))
  const output = 'out.mp4'

  const streams = inputs
    .map(
      (_, i) =>
        `[${i}:v:0]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];`,
    )
    .join('')
  const vLabels = inputs.map((_, i) => `[v${i}][${i}:a:0?]`).join('')
  const filter = `${streams}${vLabels}concat=n=${inputs.length}:v=1:a=1[outv][outa]`

  const args = [
    ...inputs.flatMap((inp) => ['-i', inp.name]),
    '-filter_complex',
    filter,
    '-map',
    '[outv]',
    '-map',
    '[outa]',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '25',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    output,
  ]

  const inputData = await Promise.all(
    inputs.map(async (inp) => ({
      name: inp.name,
      data: new Uint8Array(await inp.file.arrayBuffer()),
    })),
  )

  const { outputs } = await runFFmpeg({
    inputs: inputData,
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: 'video/mp4' })
}

export type AudioExtractFormat = 'mp3' | 'aac' | 'wav'

export interface ExtractAudioOptions extends Job {
  format: AudioExtractFormat
  durationSec?: number
}

export async function extractAudio(file: File, opt: ExtractAudioOptions): Promise<Blob> {
  const input = vfsName(file.name)
  const output = `out.${opt.format === 'aac' ? 'm4a' : opt.format}`
  const enc =
    opt.format === 'mp3'
      ? ['-c:a', 'libmp3lame', '-q:a', '2']
      : opt.format === 'aac'
        ? ['-c:a', 'aac', '-b:a', '192k']
        : ['-c:a', 'pcm_s16le']

  const args = ['-i', input, '-vn', ...enc, output]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  const mime =
    opt.format === 'mp3' ? 'audio/mpeg' : opt.format === 'aac' ? 'audio/mp4' : 'audio/wav'
  return new Blob([toBufferSource(outputs[0].data)], { type: mime })
}

export interface GifOptions extends Job {
  fps?: number
  width?: number
  durationSec?: number
}

/** High-quality GIF via a two-color-pass palette in one filtergraph. */
export async function toGif(file: File, opt: GifOptions): Promise<Blob> {
  const input = vfsName(file.name)
  const output = 'out.gif'
  const fps = opt.fps ?? 12
  const width = opt.width ?? 480
  const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`

  const args = ['-i', input, '-vf', filter, '-loop', '0', output]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: 'image/gif' })
}

function mimeForContainer(container: VideoContainer | string): string {
  switch (container) {
    case 'webm':
      return 'video/webm'
    case 'mkv':
      return 'video/x-matroska'
    case 'mov':
      return 'video/quicktime'
    case 'gif':
      return 'image/gif'
    case 'mp4':
    default:
      return 'video/mp4'
  }
}

/** Copy into a fresh ArrayBuffer so Blob gets a plain (non-shared) buffer. */
function toBufferSource(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.length)
  copy.set(data)
  return copy.buffer
}
