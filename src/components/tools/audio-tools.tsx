import { useEffect, useState } from 'react'
import { Field, Segmented, Select, Slider } from '@/components/ui/primitives'
import { ToolFrame } from './ToolFrame'
import { SingleResult } from './results'
import { TrimControls } from './TrimControls'
import { TOOLS } from '@/tools/registry-meta'
import { useMediaInfo } from '@/hooks/useMediaInfo'
import { probeAudio } from '@/lib/probe'
import { outputName } from '@/lib/format'
import { FREE_BATCH_LIMIT } from '@/config'
import {
  AUDIO_FORMATS,
  compressAudio,
  convertAudio,
  mergeAudio,
  trimAudio,
  type AudioFormat,
} from '@/lib/audio'

interface AudioResult {
  blob: Blob
  filename: string
  originalSize?: number
}

const renderAudio = (r: AudioResult) => (
  <SingleResult blob={r.blob} filename={r.filename} kind="audio" originalSize={r.originalSize} />
)

const BITRATES = [96, 128, 160, 192, 256, 320]

// ── Convert ──
export function AudioConvert() {
  const [format, setFormat] = useState<AudioFormat>('mp3')
  const [bitrate, setBitrate] = useState(192)
  const lossy = format === 'mp3' || format === 'm4a' || format === 'ogg'
  return (
    <ToolFrame<AudioResult>
      meta={TOOLS.audioConvert}
      engine
      actionLabel="Convert audio"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label="Convert to">
            <Select value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
              {AUDIO_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          {lossy && (
            <Field label="Bitrate">
              <Segmented
                value={String(bitrate)}
                onChange={(v) => setBitrate(Number(v))}
                options={BITRATES.map((b) => ({ value: String(b), label: `${b}k` }))}
              />
            </Field>
          )}
        </div>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeAudio(file).catch(() => ({ duration: 0 }))
        const blob = await convertAudio(file, {
          format,
          bitrateKbps: bitrate,
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, '', format), originalSize: file.size }
      }}
      renderResult={renderAudio}
    />
  )
}

// ── Compress ──
export function AudioCompress() {
  const [bitrate, setBitrate] = useState(128)
  const [format, setFormat] = useState<'mp3' | 'm4a' | 'ogg'>('mp3')
  return (
    <ToolFrame<AudioResult>
      meta={TOOLS.audioCompress}
      engine
      actionLabel="Compress audio"
      controls={() => (
        <div className="flex flex-col gap-5">
          <Field label={`Bitrate · ${bitrate} kbps`} hint="Lower bitrate = smaller file.">
            <Slider min={64} max={320} step={16} value={bitrate} onChange={(v) => setBitrate(Math.round(v))} />
          </Field>
          <Field label="Format">
            <Segmented
              value={format}
              onChange={setFormat}
              options={[
                { value: 'mp3', label: 'MP3' },
                { value: 'm4a', label: 'M4A' },
                { value: 'ogg', label: 'OGG' },
              ]}
            />
          </Field>
        </div>
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const { duration } = await probeAudio(file).catch(() => ({ duration: 0 }))
        const blob = await compressAudio(file, {
          bitrateKbps: bitrate,
          format,
          durationSec: duration,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, 'compressed', format), originalSize: file.size }
      }}
      renderResult={renderAudio}
    />
  )
}

// ── Trim ──
export function AudioTrim() {
  const [format, setFormat] = useState<AudioFormat>('mp3')
  const [range, setRange] = useState<{ start: number; end: number } | null>(null)
  return (
    <ToolFrame<AudioResult>
      meta={TOOLS.audioTrim}
      engine
      actionLabel="Trim audio"
      validate={() => (range && range.end <= range.start ? 'End must be after start.' : null)}
      controls={(files) => (
        <TrimAudioFields file={files[0]} range={range} setRange={setRange} format={format} setFormat={setFormat} />
      )}
      action={async (files, ctx) => {
        const file = files[0]
        const meta = await probeAudio(file).catch(() => ({ duration: 0 }))
        const start = range?.start ?? 0
        const end = range?.end ?? meta.duration
        const blob = await trimAudio(file, {
          start,
          end,
          format,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return { blob, filename: outputName(file.name, 'trimmed', format), originalSize: file.size }
      }}
      renderResult={renderAudio}
    />
  )
}

function TrimAudioFields({
  file,
  range,
  setRange,
  format,
  setFormat,
}: {
  file: File
  range: { start: number; end: number } | null
  setRange: (r: { start: number; end: number }) => void
  format: AudioFormat
  setFormat: (v: AudioFormat) => void
}) {
  const info = useMediaInfo(file, 'audio')
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
      <Field label="Output format">
        <Select value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
          {AUDIO_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}

// ── Merge ──
export function AudioMerge() {
  const [format, setFormat] = useState<AudioFormat>('mp3')
  return (
    <ToolFrame<AudioResult>
      meta={TOOLS.audioMerge}
      engine
      minFiles={2}
      reorderable
      proAboveCount={FREE_BATCH_LIMIT}
      actionLabel="Merge audio"
      controls={() => (
        <Field label="Output format">
          <Select value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
            {AUDIO_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      action={async (files, ctx) => {
        const blob = await mergeAudio(files, {
          format,
          onProgress: ctx.onProgress,
          signal: ctx.signal,
        })
        return {
          blob,
          filename: `vormexa-merged.${format}`,
          originalSize: files.reduce((n, f) => n + f.size, 0),
        }
      }}
      renderResult={renderAudio}
    />
  )
}
