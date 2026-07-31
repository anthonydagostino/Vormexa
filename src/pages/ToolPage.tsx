import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getToolMeta, toolKey } from '@/tools/registry-meta'
import { LAZY_TOOLS } from '@/tools/lazy'
import { Spinner } from '@/components/ui/primitives'
import { NotFound } from './NotFound'

export function ToolPage() {
  const { category = '', slug = '' } = useParams()
  const meta = getToolMeta(category, slug)
  const key = toolKey(category, slug)

  useEffect(() => {
    const defaultTitle = 'Vormexa — Video, Photo, Audio & PDF Tools · 100% Offline'
    const defaultDesc =
      'Vormexa is an all-in-one media toolkit. Compress, convert, resize & merge video, photos, audio and PDFs — 100% on your device.'
    if (meta) {
      document.title = `${meta.title} · Vormexa`
      setMetaDescription(`${meta.description} Free & 100% on-device — nothing is uploaded.`)
    }
    return () => {
      document.title = defaultTitle
      setMetaDescription(defaultDesc)
    }
  }, [meta])

  if (!meta || !key) return <NotFound />
  const Component = LAZY_TOOLS[key]
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      }
    >
      <Component />
    </Suspense>
  )
}

/** Update the <meta name="description"> tag for SEO on tool routes. */
function setMetaDescription(content: string) {
  let tag = document.querySelector('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}
