import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Pricing } from '@/pages/Pricing'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'
import { Workspace } from '@/pages/Workspace'
import { ToolPage } from '@/pages/ToolPage'
import { Account } from '@/pages/Account'
import { NotFound } from '@/pages/NotFound'
import { useLicenseRefresh } from '@/hooks/usePro'
import { useDesktopLinks } from '@/hooks/useDesktopLinks'

export default function App() {
  useLicenseRefresh()
  useDesktopLinks()
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Workspace />} />
          <Route path="account" element={<Account />} />
          <Route path=":category/:slug" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<MarketingLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      {/* First-party, cookieless traffic analytics (enable in the Vercel dashboard). */}
      <Analytics />
    </BrowserRouter>
  )
}

function NotFoundPage() {
  return (
    <div className="container-x py-20">
      <NotFound />
    </div>
  )
}
