import { useEffect } from 'react'
import { useLicense } from '@/store/license'

/** Whether the current user has an active Pro license. */
export function usePro(): { isPro: boolean } {
  const valid = useLicense((s) => s.valid)
  return { isPro: valid }
}

/** Re-validate the stored license once on app start (no-op if none). */
export function useLicenseRefresh(): void {
  const refresh = useLicense((s) => s.refresh)
  const key = useLicense((s) => s.key)
  useEffect(() => {
    if (key) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
