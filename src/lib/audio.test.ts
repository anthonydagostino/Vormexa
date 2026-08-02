import { describe, expect, it } from 'vitest'
import { AUDIO_FORMATS, audioMime, encoderArgs, type AudioFormat } from './audio'

// These are the pure parts of the audio engine — the ffmpeg command contract.
// The actual encoding runs in a real browser and is covered by the e2e suite.

describe('audioMime', () => {
  it('maps every format to the right MIME type', () => {
    expect(audioMime('mp3')).toBe('audio/mpeg')
    expect(audioMime('m4a')).toBe('audio/mp4')
    expect(audioMime('wav')).toBe('audio/wav')
    expect(audioMime('ogg')).toBe('audio/ogg')
    expect(audioMime('flac')).toBe('audio/flac')
  })
})

describe('AUDIO_FORMATS registry', () => {
  it('lists a label for every selectable format with no duplicates', () => {
    const values = AUDIO_FORMATS.map((f) => f.value)
    expect(new Set(values).size).toBe(values.length)
    for (const f of AUDIO_FORMATS) {
      expect(f.label).toBeTruthy()
      expect(audioMime(f.value)).toMatch(/^audio\//)
    }
  })
})

describe('encoderArgs', () => {
  it('uses the requested bitrate for lossy codecs', () => {
    expect(encoderArgs('mp3', 320)).toEqual(['-c:a', 'libmp3lame', '-b:a', '320k'])
    expect(encoderArgs('m4a', 256)).toEqual(['-c:a', 'aac', '-b:a', '256k'])
    expect(encoderArgs('ogg', 128)).toEqual(['-c:a', 'libvorbis', '-b:a', '128k'])
  })

  it('falls back to a sane default bitrate (192k) when unspecified', () => {
    expect(encoderArgs('mp3')).toEqual(['-c:a', 'libmp3lame', '-b:a', '192k'])
  })

  it('ignores bitrate for lossless codecs', () => {
    expect(encoderArgs('wav', 320)).toEqual(['-c:a', 'pcm_s16le'])
    expect(encoderArgs('flac', 320)).toEqual(['-c:a', 'flac'])
  })

  it('covers every declared format (no unhandled switch case)', () => {
    for (const { value } of AUDIO_FORMATS) {
      const args = encoderArgs(value as AudioFormat)
      expect(args.length).toBeGreaterThan(0)
      expect(args[0]).toBe('-c:a')
    }
  })
})
