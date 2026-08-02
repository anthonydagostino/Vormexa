import { describe, expect, it } from 'vitest'
import { CRF_BY_LEVEL, codecArgs, mimeForContainer, VIDEO_CONTAINERS } from './video'

// Pure parts of the video engine — the ffmpeg command contract. Real encoding
// runs in a browser and is covered by the e2e suite.

describe('mimeForContainer', () => {
  it('maps known containers to MIME types', () => {
    expect(mimeForContainer('mp4')).toBe('video/mp4')
    expect(mimeForContainer('webm')).toBe('video/webm')
    expect(mimeForContainer('mkv')).toBe('video/x-matroska')
    expect(mimeForContainer('mov')).toBe('video/quicktime')
    expect(mimeForContainer('gif')).toBe('image/gif')
  })
  it('defaults unknown containers to mp4', () => {
    expect(mimeForContainer('xyz')).toBe('video/mp4')
  })
})

describe('CRF_BY_LEVEL', () => {
  it('monotonically increases CRF (lower quality) as compression strengthens', () => {
    expect(CRF_BY_LEVEL.light).toBeLessThan(CRF_BY_LEVEL.balanced)
    expect(CRF_BY_LEVEL.balanced).toBeLessThan(CRF_BY_LEVEL.strong)
    expect(CRF_BY_LEVEL.strong).toBeLessThan(CRF_BY_LEVEL.extreme)
  })
  it('stays within the valid x264 CRF range', () => {
    for (const crf of Object.values(CRF_BY_LEVEL)) {
      expect(crf).toBeGreaterThanOrEqual(0)
      expect(crf).toBeLessThanOrEqual(51)
    }
  })
})

describe('codecArgs', () => {
  it('encodes H.264 with web-safe defaults for mp4', () => {
    const args = codecArgs('mp4', 23)
    expect(args).toContain('libx264')
    // yuv420p → plays in every browser/device; +faststart → streams while loading.
    expect(args).toContain('yuv420p')
    expect(args.join(' ')).toContain('-movflags +faststart')
    expect(args).toContain('-crf')
    expect(args[args.indexOf('-crf') + 1]).toBe('23')
  })

  it('adds +faststart for mov but not for mkv', () => {
    expect(codecArgs('mov', 23).join(' ')).toContain('+faststart')
    expect(codecArgs('mkv', 23).join(' ')).not.toContain('faststart')
  })

  it('uses the VP8/Vorbis stack for webm', () => {
    const args = codecArgs('webm', 30)
    expect(args).toContain('libvpx')
    expect(args).toContain('libvorbis')
    expect(args[args.indexOf('-crf') + 1]).toBe('30')
  })

  it('returns no codec args for gif (handled by a separate palette pass)', () => {
    expect(codecArgs('gif', 23)).toEqual([])
  })
})

describe('VIDEO_CONTAINERS registry', () => {
  it('has a unique, labeled entry per container', () => {
    const values = VIDEO_CONTAINERS.map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
    for (const c of VIDEO_CONTAINERS) expect(c.label).toBeTruthy()
  })
})
