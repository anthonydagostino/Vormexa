import { afterEach, describe, expect, it, vi } from 'vitest'
import { activateLicense, deactivateLicense, validateLicense } from './license'

function mockFetch(payload: unknown, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => payload,
  } as Response)
}

afterEach(() => vi.restoreAllMocks())

describe('license API client', () => {
  it('activates a key and sends the expected request', async () => {
    const spy = mockFetch({
      activated: true,
      error: null,
      license_key: { status: 'active' },
      instance: { id: 'inst_1', name: 'Vormexa Web' },
    })

    const res = await activateLicense('MY-KEY', 'Vormexa Web · linux')
    expect(res.activated).toBe(true)
    expect(res.instance?.id).toBe('inst_1')

    const [url, opts] = spy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.lemonsqueezy.com/v1/licenses/activate')
    const body = opts.body as URLSearchParams
    expect(body.get('license_key')).toBe('MY-KEY')
    expect(body.get('instance_name')).toBe('Vormexa Web · linux')
  })

  it('trims the key before sending', async () => {
    const spy = mockFetch({
      activated: true,
      error: null,
      license_key: null,
      instance: { id: 'i', name: 'n' },
    })
    await activateLicense('  spaced-key  ', 'n')
    const body = (spy.mock.calls[0][1] as RequestInit).body as URLSearchParams
    expect(body.get('license_key')).toBe('spaced-key')
  })

  it('surfaces activation errors from the server body', async () => {
    mockFetch(
      { activated: false, error: 'license_key not found', license_key: null, instance: null },
      false,
    )
    const res = await activateLicense('BAD', 'n')
    expect(res.activated).toBe(false)
    expect(res.error).toMatch(/not found/)
  })

  it('validates and deactivates using the instance id', async () => {
    const valSpy = mockFetch({
      valid: true,
      error: null,
      license_key: { status: 'active' },
      instance: { id: 'i', name: 'n' },
    })
    const v = await validateLicense('K', 'inst_9')
    expect(v.valid).toBe(true)
    expect((valSpy.mock.calls[0][1] as RequestInit).body).toBeInstanceOf(URLSearchParams)

    const deSpy = mockFetch({ deactivated: true, error: null })
    const d = await deactivateLicense('K', 'inst_9')
    expect(d.deactivated).toBe(true)
    const body = (deSpy.mock.calls[0][1] as RequestInit).body as URLSearchParams
    expect(body.get('instance_id')).toBe('inst_9')
  })
})
