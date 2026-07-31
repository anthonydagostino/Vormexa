import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'
import { CATEGORIES, toolsByCategory } from '@/tools/registry-meta'
import { toolPath } from '@/tools/types'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" />
              <span className="text-xl font-extrabold tracking-tight text-white">Vormexa</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              The all-in-one media toolkit. Compress, convert, resize and merge video, photos, audio
              and PDFs — entirely on your device.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Nothing is ever uploaded
            </p>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h4 className="mb-3 text-sm font-semibold text-white">{cat.label}</h4>
              <ul className="flex flex-col gap-2">
                {toolsByCategory(cat.id).map((t) => (
                  <li key={t.slug}>
                    <Link to={toolPath(t)} className="text-sm text-slate-400 hover:text-brand-300">
                      {t.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">© {'2026'} Vormexa. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="/pricing" className="hover:text-slate-300">
              Pricing
            </Link>
            <Link to="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
