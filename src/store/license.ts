import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  activateLicense,
  deactivateLicense,
  validateLicense,
  type LicenseKeyInfo,
} from '@/lib/license'
import { lemon } from '@/config'

/**
 * Pro entitlement state, persisted to localStorage. Because the app has no
 * backend, "am I Pro?" is answered by a license key validated against Lemon
 * Squeezy. This is deliberately soft DRM — appropriate for a client-side tool
 * where we sell convenience, not un-crackable access.
 */

interface LicenseState {
  key: string | null
  instanceId: string | null
  status: LicenseKeyInfo['status'] | null
  valid: boolean
  activatedAt: number | null

  activate: (key: string) => Promise<{ ok: boolean; error?: string }>
  refresh: () => Promise<void>
  deactivate: () => Promise<void>
}

function instanceName(): string {
  return `${lemon.storeName} Web · ${navigator.platform || 'browser'}`
}

export const useLicense = create<LicenseState>()(
  persist(
    (set, get) => ({
      key: null,
      instanceId: null,
      status: null,
      valid: false,
      activatedAt: null,

      activate: async (rawKey) => {
        const key = rawKey.trim()
        if (!key) return { ok: false, error: 'Enter a license key.' }
        try {
          const res = await activateLicense(key, instanceName())
          if (!res.activated || !res.instance) {
            return { ok: false, error: res.error ?? 'That license key could not be activated.' }
          }
          set({
            key,
            instanceId: res.instance.id,
            status: res.license_key?.status ?? 'active',
            valid: true,
            activatedAt: Date.now(),
          })
          return { ok: true }
        } catch (e) {
          return { ok: false, error: (e as Error).message || 'Could not reach the license server.' }
        }
      },

      refresh: async () => {
        const { key, instanceId } = get()
        if (!key || !instanceId) return
        try {
          const res = await validateLicense(key, instanceId)
          set({ valid: res.valid, status: res.license_key?.status ?? get().status })
        } catch {
          /* keep last-known state when offline — Pro shouldn't drop on a flaky network */
        }
      },

      deactivate: async () => {
        const { key, instanceId } = get()
        if (key && instanceId) await deactivateLicense(key, instanceId).catch(() => undefined)
        set({ key: null, instanceId: null, status: null, valid: false, activatedAt: null })
      },
    }),
    { name: 'vormexa-license' },
  ),
)
