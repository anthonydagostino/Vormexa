import { useEffect } from 'react'
import { isTauri } from '@/lib/platform'
import { openExternal } from '@/lib/external'

/**
 * In the desktop app, intercept clicks on external links (http(s) to another
 * origin, or mailto) and open them in the user's real browser / mail client
 * instead of trying to navigate the app's web view. No-op in a normal browser.
 */
export function useDesktopLinks(): void {
  useEffect(() => {
    if (!isTauri()) return

    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      const anchor = (e.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''

      const isMailto = /^mailto:/i.test(href)
      const isHttp = /^https?:/i.test(href)
      if (!isMailto && !isHttp) return // in-app router links start with "/"
      if (isHttp && href.startsWith(window.location.origin)) return // same-origin nav

      e.preventDefault()
      void openExternal(href)
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])
}
