import { runFFmpeg, vfsName, type RunProgress } from './ffmpeg'

/** Audio operations via ffmpeg.wasm — fully on-device. */

export interface Job {
  onProgress?: RunProgress
  signal?: AbortSignal
}

export type AudioFormat = 'mp3' | 'm4a' | 'wav' | 'ogg' | 'flac'

export const AUDIO_FORMATS: { value: AudioFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'm4a', label: 'M4A (AAC)' },
  { value: 'wav', label: 'WAV (lossless)' },
  { value: 'ogg', label: 'OGG (Vorbis)' },
  { value: 'flac', label: 'FLAC (lossless)' },
]

/** Build the ffmpeg encoder args for an audio format. Exported for testing. */
export function encoderArgs(format: AudioFormat, bitrateKbps?: number): string[] {
  switch (format) {
    case 'mp3':
      return ['-c:a', 'libmp3lame', '-b:a', `${bitrateKbps ?? 192}k`]
    case 'm4a':
      return ['-c:a', 'aac', '-b:a', `${bitrateKbps ?? 192}k`]
    case 'ogg':
      return ['-c:a', 'libvorbis', '-b:a', `${bitrateKbps ?? 192}k`]
    case 'wav':
      return ['-c:a', 'pcm_s16le']
    case 'flac':
      return ['-c:a', 'flac']
  }
}

export function audioMime(format: AudioFormat): string {
  switch (format) {
    case 'mp3':
      return 'audio/mpeg'
    case 'm4a':
      return 'audio/mp4'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case 'flac':
      return 'audio/flac'
  }
}

export interface ConvertAudioOptions extends Job {
  format: AudioFormat
  bitrateKbps?: number
  durationSec?: number
}

export async function convertAudio(file: File, opt: ConvertAudioOptions): Promise<Blob> {
  const input = vfsName(file.name)
  const output = `out.${opt.format}`
  const args = ['-i', input, '-vn', ...encoderArgs(opt.format, opt.bitrateKbps), output]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: audioMime(opt.format) })
}

export interface CompressAudioOptions extends Job {
  bitrateKbps: number
  format?: Extract<AudioFormat, 'mp3' | 'm4a' | 'ogg'>
  durationSec?: number
}

export async function compressAudio(file: File, opt: CompressAudioOptions): Promise<Blob> {
  const format = opt.format ?? 'mp3'
  return convertAudio(file, {
    format,
    bitrateKbps: opt.bitrateKbps,
    durationSec: opt.durationSec,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
}

export interface TrimAudioOptions extends Job {
  start: number
  end: number
  format?: AudioFormat
  durationSec?: number
}

export async function trimAudio(file: File, opt: TrimAudioOptions): Promise<Blob> {
  const format = opt.format ?? 'mp3'
  const input = vfsName(file.name)
  const output = `out.${format}`
  const dur = Math.max(0, opt.end - opt.start)
  const args = [
    '-ss',
    String(opt.start),
    '-i',
    input,
    '-t',
    String(dur),
    '-vn',
    ...encoderArgs(format),
    output,
  ]
  const { outputs } = await runFFmpeg({
    inputs: [{ name: input, data: new Uint8Array(await file.arrayBuffer()) }],
    args,
    outputs: [output],
    durationSec: dur,
    onProgress: opt.onProgress,
    signal: opt.signal,
  })
  return new Blob([toBufferSource(outputs[0].data)], { type: audioMime(format) })
}

export interface MergeAudioOptions extends Job {
  format?: AudioFormat
  durationSec?: number
}

/** Concatenate audio tracks end-to-end via the concat filter. */
export async function mergeAudio(files: File[], opt: MergeAudioOptions = {}): Promise<Blob> {
  const format = opt.format ?? 'mp3'
  const inputs = files.map((f) => ({ name: vfsName(f.name), file: f }))
  const output = `out.${format}`
  const labels = inputs.map((_, i) => `[${i}:a:0]`).join('')
  const filter = `${labels}concat=n=${inputs.length}:v=0:a=1[outa]`

  const args = [
    ...inputs.flatMap((inp) => ['-i', inp.name]),
    '-filter_complex',
    filter,
    '-map',
    '[outa]',
    ...encoderArgs(format),
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
  return new Blob([toBufferSource(outputs[0].data)], { type: audioMime(format) })
}

function toBufferSource(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.length)
  copy.set(data)
  return copy.buffer
}
