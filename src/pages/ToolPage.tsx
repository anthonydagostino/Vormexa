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
    if (meta) document.title = `${meta.title} · Vormexa`
    return () => {
      document.title = 'Vormexa — Video, Photo, Audio & PDF Tools · 100% Offline'
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
