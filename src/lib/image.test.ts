import { describe, expect, it } from 'vitest'
import { computeSize } from './image'

// computeSize is the pure sizing math behind every resize/crop. (The actual
// pixel work needs a real <canvas>, which is covered by the e2e tests.)
describe('computeSize', () => {
  it('returns source dimensions when no target is given', () => {
    const r = computeSize(640, 480, {})
    expect([r.w, r.h]).toEqual([640, 480])
  })

  it('derives the missing dimension from aspect ratio in fit mode', () => {
    const r = computeSize(1000, 500, { width: 500, mode: 'fit' })
    expect([r.w, r.h]).toEqual([500, 250])
    expect([r.drawW, r.drawH]).toEqual([500, 250])
  })

  it('stretch fills the exact box', () => {
    const r = computeSize(1000, 500, { width: 300, height: 300, mode: 'stretch' })
    expect(r).toMatchObject({ w: 300, h: 300, drawW: 300, drawH: 300, dx: 0, dy: 0 })
  })

  it('cover crops to the target box and centers the overflow', () => {
    const r = computeSize(1000, 1000, { width: 400, height: 300, mode: 'cover' })
    expect([r.w, r.h]).toEqual([400, 300])
    expect([r.drawW, r.drawH]).toEqual([400, 400])
    expect(r.dy).toBe(-50)
  })

  it('never upscales when noUpscale is set', () => {
    const r = computeSize(100, 100, { width: 500, mode: 'fit', noUpscale: true })
    expect([r.w, r.h]).toEqual([100, 100])
  })

  it('derives the missing width from a height-only request', () => {
    const r = computeSize(1000, 500, { height: 250, mode: 'fit' })
    expect([r.w, r.h]).toEqual([500, 250])
  })

  it('cover crops horizontally for a portrait target box', () => {
    const r = computeSize(1000, 1000, { width: 300, height: 400, mode: 'cover' })
    expect([r.w, r.h]).toEqual([300, 400])
    expect([r.drawW, r.drawH]).toEqual([400, 400])
    expect(r.dx).toBe(-50)
  })

  it('clamps to the source when noUpscale is set with both dimensions', () => {
    const r = computeSize(100, 100, { width: 500, height: 500, mode: 'fit', noUpscale: true })
    expect([r.w, r.h]).toEqual([100, 100])
  })

  it('stretch is free to upscale past the source', () => {
    const r = computeSize(100, 100, { width: 400, height: 200, mode: 'stretch' })
    expect(r).toMatchObject({ w: 400, h: 200, drawW: 400, drawH: 200 })
  })
})
