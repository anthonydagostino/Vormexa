import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, Wifi } from 'lucide-react'
import { ALL_TOOLS, CATEGORIES, searchTools } from '@/tools/registry-meta'
import { toolPath } from '@/tools/types'
import type { ToolMeta } from '@/tools/types'

export function Workspace() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => (query ? searchTools(query) : ALL_TOOLS), [query])

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Your media toolbox
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          {ALL_TOOLS.length} tools for video, photos, audio and PDFs. Pick one, drop a file, and
          everything runs on your device.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Files never leave your device
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="h-4 w-4 text-brand-300" /> Works offline
          </span>
        </div>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 20+ tools…"
          className="input pl-10"
        />
      </div>

      {query ? (
        <ToolGrid tools={results} />
      ) : (
        CATEGORIES.map((cat) => (
          <section key={cat.id} className="mb-10">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <cat.icon className="h-4.5 w-4.5 text-slate-300" />
              </div>
              <h2 className="text-lg font-bold text-white">{cat.label}</h2>
              <span className="text-sm text-slate-500">{cat.blurb}</span>
            </div>
            <ToolGrid tools={ALL_TOOLS.filter((t) => t.category === cat.id)} />
          </section>
        ))
      )}

      {query && results.length === 0 && (
        <p className="py-16 text-center text-slate-500">
          No tools match “{query}”. Try “compress”, “convert”, “merge”…
        </p>
      )}
    </div>
  )
}

function ToolGrid({ tools }: { tools: ToolMeta[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => (
        <ToolCard key={`${t.category}/${t.slug}`} tool={t} />
      ))}
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = tool.icon
  return (
    <Link
      to={toolPath(tool)}
      className="group card flex items-start gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-glow"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 transition-colors group-hover:bg-brand-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-100 group-hover:text-white">{tool.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{tool.description}</p>
      </div>
    </Link>
  )
}
