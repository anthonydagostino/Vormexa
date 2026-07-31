import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Cpu,
  Gauge,
  HardDriveDownload,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { ALL_TOOLS, CATEGORIES, toolsByCategory } from '@/tools/registry-meta'
import { toolPath } from '@/tools/types'
import { isTauri } from '@/lib/platform'

export function Home() {
  // The desktop app opens straight into the tools, not the marketing page.
  if (isTauri()) return <Navigate to="/app" replace />
  return (
    <>
      <Hero />
      <TrustBar />
      <Categories />
      <Features />
      <Privacy />
      <HowItWorks />
      <Compare />
      <CTA />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />

      <div className="container-x relative py-20 text-center sm:py-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
          <Sparkles className="h-4 w-4 text-brand-300" />
          All-in-one media studio · {ALL_TOOLS.length} tools
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
          Edit video, photos, audio & PDFs. <span className="text-gradient">All in one place.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Vormexa compresses, converts, resizes and merges your media in seconds — right in your
          browser. No uploads, no sign-up, no watermarks. Your files never leave your device.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/app">
            <Button
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              className="flex-row-reverse"
            >
              Start editing — it's free
            </Button>
          </Link>
          <Link to="/#features">
            <Button size="lg" variant="outline">
              See all tools
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          {[
            { icon: WifiOff, label: 'Works offline' },
            { icon: Lock, label: '100% private' },
            { icon: Check, label: 'No sign-up' },
            { icon: Zap, label: 'No watermarks' },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <item.icon className="h-4 w-4 text-emerald-400" /> {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const stats = [
    { value: `${ALL_TOOLS.length}+`, label: 'Built-in tools' },
    { value: '4', label: 'Media types' },
    { value: '0', label: 'Files uploaded' },
    { value: '100%', label: 'On your device' },
  ]
  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="container-x grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-extrabold text-white sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow="One app, every format"
        title="Everything you need, nothing you don't"
        subtitle="Stop juggling a dozen single-purpose websites. Vormexa replaces them all with one fast, private toolkit."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`card relative overflow-hidden bg-gradient-to-br ${cat.gradient} p-6`}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <cat.icon className={`h-5.5 w-5.5 ${cat.accent}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{cat.label}</h3>
                <p className="text-sm text-slate-400">{cat.blurb}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {toolsByCategory(cat.id).map((t) => (
                <Link
                  key={t.slug}
                  to={toolPath(t)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                >
                  {t.short}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const FEATURES = [
  {
    icon: Layers,
    title: 'Truly all-in-one',
    body: 'Compress, convert, resize, crop, trim and merge — for video, images, audio and PDFs, all under one roof.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Processing happens locally with WebAssembly. Your files are never uploaded to any server, ever.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    body: 'Install it once and it keeps working with no internet — on a plane, a train, or anywhere.',
  },
  {
    icon: Gauge,
    title: 'Fast & lightweight',
    body: 'A clean, focused interface that gets out of your way. Drop a file, tweak, done in seconds.',
  },
  {
    icon: HardDriveDownload,
    title: 'Save storage space',
    body: 'Smart compression shrinks files dramatically while keeping the quality you care about.',
  },
  {
    icon: Cpu,
    title: 'Pro-grade engine',
    body: 'Powered by the same FFmpeg technology the pros use — no quality compromises.',
  },
]

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-white/5 bg-ink-900/30">
      <div className="container-x py-20">
        <SectionHeading
          eyebrow="Built for content creators"
          title="Professional results, effortlessly"
          subtitle="Everything a creator needs to prep media for social, web and clients — without the bloated software or subscriptions."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Privacy() {
  return (
    <section id="privacy" className="container-x scroll-mt-20 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">
            <Lock className="h-4 w-4" /> Privacy you can verify
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your files stay yours
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            Most “free” online editors quietly upload your private videos and documents to their
            servers. Vormexa doesn't. Every edit runs inside your own browser using WebAssembly, so
            your media is physically incapable of leaving your device.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {[
              'No uploads — files are read straight from disk',
              'No accounts, tracking, or hidden telemetry',
              'No watermarks and no file-size gates',
              'Open the network tab and see for yourself',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-300">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Cpu className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Your device</p>
                  <p className="text-xs text-slate-400">Editing happens here</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-400">✓ Secure</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs">no data sent</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-red-500/5 p-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Server className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">Cloud servers</p>
                  <p className="text-xs text-slate-500">Never touched</p>
                </div>
              </div>
              <span className="text-xs font-medium text-red-400/80">✕ Bypassed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Choose a tool',
      body: 'Pick from 20+ tools for video, photos, audio or PDF.',
    },
    {
      n: '2',
      title: 'Drop your file',
      body: 'Drag & drop or browse. It loads instantly — no upload wait.',
    },
    {
      n: '3',
      title: 'Download result',
      body: 'Tweak the options, run it, and save the result locally.',
    },
  ]
  return (
    <section className="border-y border-white/5 bg-ink-900/30">
      <div className="container-x py-20">
        <SectionHeading eyebrow="Dead simple" title="Three steps, that's it" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-black text-white shadow-glow">
                {s.n}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Compare() {
  const rows = [
    ['Works without uploading files', true, false],
    ['Fully functional offline', true, false],
    ['No account required', true, false],
    ['No watermarks', true, false],
    ['No file-size limits*', true, false],
    ['Video, photo, audio & PDF in one app', true, false],
  ] as const
  return (
    <section className="container-x py-20">
      <SectionHeading
        eyebrow="Why switch"
        title="Vormexa vs. typical online editors"
        subtitle="The tools you're used to send your files to the cloud. Vormexa doesn't have to."
      />
      <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1fr_auto_auto] bg-ink-800 text-sm font-semibold">
          <div className="px-5 py-3.5 text-slate-300">Capability</div>
          <div className="px-5 py-3.5 text-center text-brand-300">Vormexa</div>
          <div className="px-5 py-3.5 text-center text-slate-500">Others</div>
        </div>
        {rows.map(([label, a, b], i) => (
          <div
            key={label}
            className={`grid grid-cols-[1fr_auto_auto] items-center text-sm ${
              i % 2 ? 'bg-ink-900/40' : 'bg-ink-900/20'
            }`}
          >
            <div className="px-5 py-3.5 text-slate-300">{label}</div>
            <div className="px-5 py-3.5 text-center">
              <Mark ok={a} />
            </div>
            <div className="px-5 py-3.5 text-center">
              <Mark ok={b} />
            </div>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-slate-600">
        *Limited only by your device's available memory.
      </p>
    </section>
  )
}

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
      <Check className="h-4 w-4" />
    </span>
  ) : (
    <span className="text-slate-600">—</span>
  )
}

function CTA() {
  return (
    <section className="container-x py-20">
      <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-600/20 via-ink-900 to-accent-500/10 px-8 py-16 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/30 blur-[100px]" />
        <h2 className="relative mx-auto max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
          Ready to edit smarter?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Open Vormexa and get your first file done in under a minute. No install, no sign-up.
        </p>
        <div className="relative mt-8">
          <Link to="/app">
            <Button
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              className="flex-row-reverse"
            >
              Launch Vormexa
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-400">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
  )
}
