import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'

const NAV = [
  { label: 'Tools', to: '/app' },
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Privacy', to: '/#privacy' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-xl font-extrabold tracking-tight text-white">Vormexa</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'text-sm font-medium text-slate-400 transition-colors hover:text-white',
                pathname === item.to && 'text-white',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/app">
            <Button icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">
              Open the app
            </Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-ink-900 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/app" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Open the app</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
