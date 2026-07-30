import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  formatDuration,
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
