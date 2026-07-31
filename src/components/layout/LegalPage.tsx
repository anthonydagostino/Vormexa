import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  updated: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
        {intro && <p className="mt-6 text-base leading-relaxed text-slate-300">{intro}</p>}
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </div>
  )
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-white">{heading}</h2>
      {children}
    </section>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-300">{children}</p>
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-slate-300">
      {children}
    </ul>
  )
}
