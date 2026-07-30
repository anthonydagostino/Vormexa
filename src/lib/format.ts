/** Formatting & filename helpers shared across every tool. */

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** "12.4s" style compact duration for progress readouts. */
export function formatSecondsShort(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`
  return formatDuration(seconds)
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`
}

/** Percentage size change vs. an original. Negative = smaller. */
export function sizeDelta(originalBytes: number, newBytes: number): string {
  if (originalBytes <= 0) return ''
  const pct = ((newBytes - originalBytes) / originalBytes) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(0)}%`
}

export function stripExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

export function getExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/** Build an output filename: base + suffix + new extension. */
export function outputName(originalName: string, suffix: string, ext: string): string {
  const base = stripExtension(originalName).replace(/[/\\?%*:|"<>]/g, '_')
  return `${base}${suffix ? `-${suffix}` : ''}.${ext.replace(/^\./, '')}`
}

/** Sanitize a name for use inside the ffmpeg virtual filesystem. */
export function safeVfsName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}
