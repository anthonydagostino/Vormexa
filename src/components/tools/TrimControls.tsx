import { Field, Slider } from '@/components/ui/primitives'
import { formatDuration } from '@/lib/format'

/** Shared start/end trim controls for audio & video tools. */
export function TrimControls({
  duration,
  start,
  end,
  onStart,
  onEnd,
}: {
  duration: number
  start: number
  end: number
  onStart: (v: number) => void
  onEnd: (v: number) => void
}) {
  const max = duration || 0
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-xl bg-ink-850 px-4 py-3 text-sm">
        <span className="text-slate-400">Selection</span>
        <span className="font-mono font-medium text-brand-300">
          {formatDuration(start)} → {formatDuration(end)}{' '}
          <span className="text-slate-500">({formatDuration(Math.max(0, end - start))})</span>
        </span>
      </div>
      <Field label={`Start · ${formatDuration(start)}`}>
        <Slider
          min={0}
          max={max}
          step={Math.max(0.1, max / 1000)}
          value={start}
          onChange={(v) => onStart(Math.min(v, end - 0.1))}
        />
      </Field>
      <Field label={`End · ${formatDuration(end)}`}>
        <Slider
          min={0}
          max={max}
          step={Math.max(0.1, max / 1000)}
          value={end}
          onChange={(v) => onEnd(Math.max(v, start + 0.1))}
        />
      </Field>
    </div>
  )
}
