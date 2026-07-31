import { isTauri } from './platform'

/**
 * Open a URL in the user's real browser / mail client.
 *
 * In the desktop app the web view can't navigate to external sites (checkout,
 * mailto, etc.), so we route those through Tauri's opener plugin. In a normal
 * browser this is just a new tab.
 */
export async function openExternal(url: string): Promise<void> {
  if (isTauri()) {
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(url)
      return
    } catch {
      /* fall through to window.open */
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
