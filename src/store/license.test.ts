import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLicense } from './license'

function mockFetch(payload: unknown, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => payload,
  } as Response)
}

// Integration: the store drives the real license API client via fetch.
describe('license store', () => {
  beforeEach(() => {
    useLicense.setState({
      key: null,
      instanceId: null,
      status: null,
      valid: false,
      activatedAt: null,
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('starts as a Free user', () => {
    expect(useLicense.getState().valid).toBe(false)
  })

  it('activates and becomes Pro on success', async () => {
    mockFetch({
      activated: true,
      error: null,
      license_key: { status: 'active' },
      instance: { id: 'inst_42', name: 'Vormexa Web' },
    })

    const res = await useLicense.getState().activate('GOOD-KEY')
    expect(res.ok).toBe(true)

    const s = useLicense.getState()
    expect(s.valid).toBe(true)
    expect(s.key).toBe('GOOD-KEY')
    expect(s.instanceId).toBe('inst_42')
    expect(s.activatedAt).toBeTypeOf('number')
  })

  it('stays Free and reports the error on a bad key', async () => {
    mockFetch({ activated: false, error: 'invalid', license_key: null, instance: null }, false)
    const res = await useLicense.getState().activate('NOPE')
    expect(res.ok).toBe(false)
    expect(res.error).toBeTruthy()
    expect(useLicense.getState().valid).toBe(false)
  })

  it('rejects empty input without calling the network', async () => {
    const spy = mockFetch({})
    const res = await useLicense.getState().activate('   ')
    expect(res.ok).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })

  it('deactivate clears Pro state', async () => {
    useLicense.setState({
      key: 'K',
      instanceId: 'i',
      status: 'active',
      valid: true,
      activatedAt: 1,
    })
    mockFetch({ deactivated: true, error: null })
    await useLicense.getState().deactivate()
    const s = useLicense.getState()
    expect(s.valid).toBe(false)
    expect(s.key).toBeNull()
  })
})
