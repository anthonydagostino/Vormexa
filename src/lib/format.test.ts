import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatSecondsShort,
  getExtension,
  outputName,
  safeVfsName,
  sizeDelta,
  stripExtension,
} from './format'

describe('formatBytes', () => {
  it('handles zero and negatives', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(-5)).toBe('0 B')
  })
  it('scales through units', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1_572_864)).toBe('1.5 MB')
    expect(formatBytes(1024 ** 3)).toBe('1 GB')
  })
})

describe('formatDuration', () => {
  it('formats mm:ss and h:mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(9)).toBe('0:09')
    expect(formatDuration(75)).toBe('1:15')
    expect(formatDuration(3661)).toBe('1:01:01')
  })
  it('guards invalid input', () => {
    expect(formatDuration(NaN)).toBe('0:00')
    expect(formatDuration(-3)).toBe('0:00')
  })
})

describe('sizeDelta', () => {
  it('reports smaller as negative and larger as positive', () => {
    expect(sizeDelta(1000, 500)).toBe('-50%')
    expect(sizeDelta(1000, 1200)).toBe('+20%')
    expect(sizeDelta(0, 100)).toBe('')
  })
})

describe('filename helpers', () => {
  it('strips and reads extensions', () => {
    expect(stripExtension('clip.final.mp4')).toBe('clip.final')
    expect(stripExtension('noext')).toBe('noext')
    expect(getExtension('photo.JPG')).toBe('jpg')
    expect(getExtension('noext')).toBe('')
  })
  it('builds safe output names', () => {
    expect(outputName('my video.mov', 'compressed', 'mp4')).toBe('my video-compressed.mp4')
    expect(outputName('a/b:c.png', '', 'webp')).toBe('a_b_c.webp')
    expect(outputName('x.png', 'thumb', '.jpg')).toBe('x-thumb.jpg')
  })
  it('sanitizes VFS names', () => {
    expect(safeVfsName('a b/c*?.mp4')).toBe('a_b_c__.mp4')
  })
})

describe('formatBytes edge cases', () => {
  it('guards non-finite input', () => {
    expect(formatBytes(NaN)).toBe('0 B')
    expect(formatBytes(Infinity)).toBe('0 B')
  })
  it('caps at the largest unit (TB) for huge values', () => {
    expect(formatBytes(1024 ** 5)).toBe('1024 TB')
  })
  it('respects the decimals argument', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 2)).toBe('1.5 KB')
  })
})

describe('formatDuration / formatSecondsShort / formatPercent', () => {
  it('formats sub-minute short durations with adaptive precision', () => {
    expect(formatSecondsShort(3)).toBe('3.0s')
    expect(formatSecondsShort(12.4)).toBe('12s')
    expect(formatSecondsShort(59.9)).toBe('60s')
  })
  it('falls back to mm:ss past a minute', () => {
    expect(formatSecondsShort(75)).toBe('1:15')
  })
  it('formats large multi-hour durations', () => {
    expect(formatDuration(36_000)).toBe('10:00:00')
  })
  it('formats percentages with configurable digits', () => {
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(0.5)).toBe('50%')
    expect(formatPercent(0.1234, 1)).toBe('12.3%')
    expect(formatPercent(1)).toBe('100%')
  })
})

describe('sizeDelta edge cases', () => {
  it('reports 0% for identical sizes and guards negative originals', () => {
    expect(sizeDelta(1000, 1000)).toBe('0%')
    expect(sizeDelta(-1, 100)).toBe('')
  })
})

describe('filename helpers — tricky inputs', () => {
  it('treats a leading-dot dotfile as having no base to strip', () => {
    // lastIndexOf('.') === 0 → not a real extension boundary.
    expect(stripExtension('.gitignore')).toBe('.gitignore')
    expect(getExtension('.gitignore')).toBe('gitignore')
  })
  it('handles trailing dots and multiple dots', () => {
    expect(stripExtension('name.')).toBe('name')
    expect(getExtension('name.')).toBe('')
    expect(stripExtension('a.b.c.mp4')).toBe('a.b.c')
    expect(getExtension('a.b.c.MP4')).toBe('mp4')
  })
  it('neutralizes path separators and traversal in output names', () => {
    // Prevents a crafted filename from steering the download path: no '/' or
    // '\' survives, so the name can never escape into a directory path.
    expect(outputName('../evil.txt', '', 'png')).toBe('.._evil.png')
    expect(outputName('sub/dir/pic.jpeg', 'x', 'webp')).toBe('sub_dir_pic-x.webp')
    expect(outputName('a\\b:c*?.png', 'x', 'jpg')).toBe('a_b_c__-x.jpg')
  })
  it('strips a leading dot from the requested extension', () => {
    expect(outputName('clip.mov', 'out', '.mp4')).toBe('clip-out.mp4')
  })
  it('safeVfsName keeps traversal tokens inert (no slashes survive)', () => {
    expect(safeVfsName('../secret')).toBe('.._secret')
    expect(safeVfsName('..\\..\\x')).toBe('.._.._x')
  })
})
