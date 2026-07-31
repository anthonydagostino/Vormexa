/** Runtime environment detection. */

/** True when running inside the Tauri desktop shell (vs a normal browser). */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
}
