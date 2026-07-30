/**
 * Lemon Squeezy license-key API client.
 *
 * These endpoints are public (keyed by the license key itself — no secret API
 * key needed), CORS-enabled, and designed to be called straight from the
 * browser. That's what lets Vormexa gate Pro features without any backend.
 *
 * Docs: https://docs.lemonsqueezy.com/api/license-api
 */

const BASE = 'https://api.lemonsqueezy.com/v1/licenses'

export interface LicenseKeyInfo {
  id: number
  status: 'inactive' | 'active' | 'expired' | 'disabled'
  key: string
  activation_limit: number
  activation_usage: number
  expires_at: string | null
}

export interface ActivateResult {
  activated: boolean
  error: string | null
  license_key: LicenseKeyInfo | null
  instance: { id: string; name: string } | null
}

export interface ValidateResult {
  valid: boolean
  error: string | null
  license_key: LicenseKeyInfo | null
  instance: { id: string; name: string } | null
}

async function post<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams(params),
  })
  // Lemon Squeezy returns a JSON body on both success and 400-level errors.
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok && !('error' in data)) {
    throw new Error(`License server error (${res.status})`)
  }
  return data
}

/** Bind a license key to this browser ("instance"). */
export function activateLicense(licenseKey: string, instanceName: string): Promise<ActivateResult> {
  return post<ActivateResult>('activate', {
    license_key: licenseKey.trim(),
    instance_name: instanceName,
  })
}

/** Check a previously-activated key is still valid (e.g. on app load). */
export function validateLicense(licenseKey: string, instanceId: string): Promise<ValidateResult> {
  return post<ValidateResult>('validate', {
    license_key: licenseKey.trim(),
    instance_id: instanceId,
  })
}

/** Release this browser's activation (frees a seat). */
export function deactivateLicense(
  licenseKey: string,
  instanceId: string,
): Promise<{ deactivated: boolean; error: string | null }> {
  return post('deactivate', {
    license_key: licenseKey.trim(),
    instance_id: instanceId,
  })
}
