import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, ShieldCheck, X } from 'lucide-react'
import { ALL_TOOLS, CATEGORIES, searchTools } from '@/tools/registry-meta'
import { toolPath } from '@/tools/types'
import { Logo } from './Logo'
import { cn } from '@/lib/cn'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()

  const results = query ? searchTools(query) : ALL_TOOLS

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-ink-900/95 backdrop-blur transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Logo className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-white">Vormexa</span>
          </Link>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="input pl-9"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {query ? (
            <ul className="flex flex-col gap-1">
              {results.map((t) => (
                <SidebarLink key={`${t.category}/${t.slug}`} to={toolPath(t)} onClick={() => setMobileOpen(false)}>
                  <t.icon className="h-4 w-4 text-slate-400" />
                  <span className="flex-1">{t.title}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-600">{t.category}</span>
                </SidebarLink>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-slate-500">No tools found</li>
              )}
            </ul>
          ) : (
            CATEGORIES.map((cat) => (
              <div key={cat.id} className="mb-4">
                <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <cat.icon className="h-3.5 w-3.5" /> {cat.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {ALL_TOOLS.filter((t) => t.category === cat.id).map((t) => (
                    <SidebarLink key={t.slug} to={toolPath(t)} onClick={() => setMobileOpen(false)}>
                      <t.icon className="h-4 w-4 text-slate-400" />
                      {t.short}
                    </SidebarLink>
                  ))}
                </ul>
              </div>
            ))
          )}
        </nav>

        <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% offline & private
          </span>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/5 bg-ink-950/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/app" className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold text-white">Vormexa</span>
          </Link>
        </header>

        <main key={location.pathname} className="animate-fade-in flex-1 px-5 py-8 sm:px-8 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  to,
  children,
  onClick,
}: {
  to: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-brand-500/15 text-brand-200'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
          )
        }
      >
        {children}
      </NavLink>
    </li>
  )
}
