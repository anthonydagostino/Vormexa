import { useEffect, useState } from 'react'
import { Field, NumberInput, Segmented, Select, Slider, Toggle } from '@/components/ui/primitives'
import { ToolFrame } from './ToolFrame'
import { SingleResult, type ResultKind } from './results'
import { TrimControls } from './TrimControls'
import { TOOLS } from '@/tools/registry-meta'
import { useMediaInfo } from '@/hooks/useMediaInfo'
import { probeVideo } from '@/lib/probe'
import { outputName } from '@/lib/format'
import {
  compressVideo,
  convertVideo,
  extractAudio,
  mergeVideos,
  resizeVideo,
  toGif,
  trimVideo,
  VIDEO_CONTAINERS,
  type CompressLevel,
  type VideoContainer,
} from '@/lib/video'

interface VideoResult {
  blob: Blob
  filename: string
  kind: ResultKind
  originalSize?: number
}

const renderVideo = (r: VideoResult) => (
  <SingleResult blob={r.blob} filename={r.filename} kind={r.kind} originalSize={r.originalSize} />
)

// ── Compress ──
export function VideoCompress() {
  const [level, setLevel] = useState<CompressLevel>('balanced')
  const [container, setContainer] = useState<'mp4' | 'webm' | 'mkv'>('mp4')
  const [maxHeight, setMaxHeight] = useState<number | ''>('')

  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoCompress}
      engine
      actionLabel="Compress video"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Compression level" hint="Stronger = smaller file, lower quality.">
            <Segmented
              value={level}
              onChange={setLevel}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'strong', label: 'Strong' },
                { value: 'extreme', label: 'Max' },
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Format">
              <Select value={container} onChange={(e) => setContainer(e.target.value as 'mp4')}>
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mkv">MKV</option>
              </Select>
            </Field>
            <Field label="Max height" hint="Optional cap.">
              <NumberInput value={maxHeight} onChange={setMaxHeight} suffix="px" placeholder="e.g. 720" />
            </Field>
          </div>
        </div>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeVideo(file).catch(() => ({ duration: 0 }))
        const blob = await compressVideo(file, {
          level,
          container,
          maxHeight: maxHeight === '' ? undefined : Number(maxHeight),
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: outputName(file.name, 'compressed', container),
          kind: 'video',
          originalSize: file.size,
        }
      }}
      renderResult={renderVideo}
    />
  )
}

// ── Convert ──
export function VideoConvert() {
  const [container, setContainer] = useState<VideoContainer>('mp4')
  const [fps, setFps] = useState<number | ''>('')
  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoConvert}
      engine
      actionLabel="Convert video"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Convert to">
            <Select value={container} onChange={(e) => setContainer(e.target.value as VideoContainer)}>
              {VIDEO_CONTAINERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Frame rate (optional)" hint="Leave blank to keep the source frame rate.">
            <NumberInput value={fps} onChange={setFps} suffix="fps" placeholder="e.g. 30" />
          </Field>
        </div>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeVideo(file).catch(() => ({ duration: 0 }))
        const blob = await convertVideo(file, {
          container,
          fps: fps === '' ? undefined : Number(fps),
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: outputName(file.name, '', container),
          kind: container === 'gif' ? 'image' : 'video',
          originalSize: file.size,
        }
      }}
      renderResult={renderVideo}
    />
  )
}

// ── Resize ──
const RES_PRESETS: { label: string; w?: number; h: number }[] = [
  { label: '2160p', h: 2160 },
  { label: '1080p', h: 1080 },
  { label: '720p', h: 720 },
  { label: '480p', h: 480 },
]

export function VideoResize() {
  const [width, setWidth] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>(720)
  const [container, setContainer] = useState<'mp4' | 'webm' | 'mkv'>('mp4')

  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoResize}
      engine
      actionLabel="Resize video"
      validate={() => (width === '' && height === '' ? 'Enter a width or a height.' : null)}
      controls={(files) => (
        <ResizeVideoFields
          file={files[0]}
          width={width}
          height={height}
          setWidth={setWidth}
          setHeight={setHeight}
          container={container}
          setContainer={setContainer}
        />
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeVideo(file).catch(() => ({ duration: 0 }))
        const blob = await resizeVideo(file, {
          width: width === '' ? undefined : Number(width),
          height: height === '' ? undefined : Number(height),
          container,
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: outputName(file.name, `${height || 'auto'}p`, container),
          kind: 'video',
          originalSize: file.size,
        }
      }}
      renderResult={renderVideo}
    />
  )
}

function ResizeVideoFields({
  file,
  width,
  height,
  setWidth,
  setHeight,
  container,
  setContainer,
}: {
  file: File
  width: number | ''
  height: number | ''
  setWidth: (v: number | '') => void
  setHeight: (v: number | '') => void
  container: 'mp4' | 'webm' | 'mkv'
  setContainer: (v: 'mp4' | 'webm' | 'mkv') => void
}) {
  const info = useMediaInfo(file, 'video')
  return (
    <div className="flex flex-col gap-5">
      {info.width > 0 && (
        <p className="text-xs text-slate-500">
          Original: {info.width} × {info.height} px
        </p>
      )}
      <Field label="Presets (height)">
        <div className="flex flex-wrap gap-2">
          {RES_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setHeight(p.h)
                setWidth('')
              }}
              className="rounded-lg bg-ink-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-ink-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Width">
          <NumberInput value={width} onChange={setWidth} suffix="px" placeholder="auto" />
        </Field>
        <Field label="Height">
          <NumberInput value={height} onChange={setHeight} suffix="px" placeholder="auto" />
        </Field>
      </div>
      <Field label="Format">
        <Select value={container} onChange={(e) => setContainer(e.target.value as 'mp4')}>
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="mkv">MKV</option>
        </Select>
      </Field>
    </div>
  )
}

// ── Trim ──
export function VideoTrim() {
  return <TrimVideoInner />
}

function TrimVideoInner() {
  const [reEncode, setReEncode] = useState(true)
  const [range, setRange] = useState<{ start: number; end: number } | null>(null)

  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoTrim}
      engine
      actionLabel="Trim video"
      validate={() => (range && range.end <= range.start ? 'End must be after start.' : null)}
      controls={(files) => (
        <TrimVideoFields file={files[0]} range={range} setRange={setRange} reEncode={reEncode} setReEncode={setReEncode} />
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const meta = await probeVideo(file).catch(() => ({ duration: 0 }))
        const start = range?.start ?? 0
        const end = range?.end ?? meta.duration
        const blob = await trimVideo(file, {
          start,
          end,
          reEncode,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, 'trimmed', 'mp4'), kind: 'video', originalSize: file.size }
      }}
      renderResult={renderVideo}
    />
  )
}

function TrimVideoFields({
  file,
  range,
  setRange,
  reEncode,
  setReEncode,
}: {
  file: File
  range: { start: number; end: number } | null
  setRange: (r: { start: number; end: number }) => void
  reEncode: boolean
  setReEncode: (v: boolean) => void
}) {
  const info = useMediaInfo(file, 'video')
  useEffect(() => {
    if (info.duration > 0 && !range) setRange({ start: 0, end: info.duration })
  }, [info.duration, range, setRange])
  const start = range?.start ?? 0
  const end = range?.end ?? info.duration
  return (
    <div className="flex flex-col gap-5">
      <TrimControls
        duration={info.duration}
        start={start}
        end={end}
        onStart={(v) => setRange({ start: v, end })}
        onEnd={(v) => setRange({ start, end: v })}
      />
      <Toggle
        checked={reEncode}
        onChange={setReEncode}
        label="Frame-accurate (re-encode). Turn off for a faster, lossless cut."
      />
    </div>
  )
}

// ── Merge ──
export function VideoMerge() {
  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoMerge}
      engine
      minFiles={2}
      reorderable
      actionLabel="Merge videos"
      helpNote="Clips are normalized to 1280×720 · 30fps so mismatched sources join cleanly."
      action={async (files, ctx) => {
        const blob = await mergeVideos(files, { onProgress: ctx.onProgress, signal: ctx.signal })
        return {
          blob,
          filename: 'vormexa-merged.mp4',
          kind: 'video',
          originalSize: files.reduce((n, f) => n + f.size, 0),
        }
      }}
      renderResult={renderVideo}
    />
  )
}

// ── Extract audio ──
export function VideoExtractAudio() {
  const [format, setFormat] = useState<'mp3' | 'aac' | 'wav'>('mp3')
  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoExtractAudio}
      engine
      actionLabel="Extract audio"
      controls={() => (
        <Field label="Audio format">
          <Segmented
            value={format}
            onChange={setFormat}
            options={[
              { value: 'mp3', label: 'MP3' },
              { value: 'aac', label: 'M4A / AAC' },
              { value: 'wav', label: 'WAV' },
            ]}
          />
        </Field>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeVideo(file).catch(() => ({ duration: 0 }))
        const blob = await extractAudio(file, {
          format,
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        const ext = format === 'aac' ? 'm4a' : format
        return { blob, filename: outputName(file.name, 'audio', ext), kind: 'audio' }
      }}
      renderResult={renderVideo}
    />
  )
}

// ── To GIF ──
export function VideoToGif() {
  const [fps, setFps] = useState(12)
  const [width, setWidth] = useState(480)
  return (
    <ToolFrame<VideoResult>
      meta={TOOLS.videoToGif}
      engine
      actionLabel="Create GIF"
      helpNote="Tip: keep clips short (a few seconds) — GIFs get large quickly."
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label={`Frame rate · ${fps} fps`}>
            <Slider min={5} max={24} value={fps} onChange={(v) => setFps(Math.round(v))} />
          </Field>
          <Field label={`Width · ${width}px`} hint="Height scales automatically.">
            <Slider min={160} max={800} step={20} value={width} onChange={(v) => setWidth(Math.round(v))} />
          </Field>
        </div>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeVideo(file).catch(() => ({ duration: 0 }))
        const blob = await toGif(file, {
          fps,
          width,
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, '', 'gif'), kind: 'image', originalSize: file.size }
      }}
      renderResult={renderVideo}
    />
  )
}
