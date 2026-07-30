import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { Home } from '@/pages/Home'
import { Pricing } from '@/pages/Pricing'
import { Workspace } from '@/pages/Workspace'
import { ToolPage } from '@/pages/ToolPage'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Workspace />} />
          <Route path=":category/:slug" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<MarketingLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
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
