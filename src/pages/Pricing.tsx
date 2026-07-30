import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { Button, Segmented } from '@/components/ui/primitives'

interface Tier {
  name: string
  tagline: string
  monthly: number
  yearly: number
  oneTime?: number
  cta: string
  highlight?: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    tagline: 'Everything you need to get started.',
    monthly: 0,
    yearly: 0,
    cta: 'Open the app',
    features: [
      'All 20+ browser tools',
      'Video, photo, audio & PDF',
      '100% on-device & private',
      'No watermarks',
      'Works offline (PWA)',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For creators who live in their media.',
    monthly: 6,
    yearly: 48,
    oneTime: 79,
    cta: 'Go Pro',
    highlight: true,
    features: [
      'Everything in Free',
      'Native desktop apps for Mac & Windows',
      'Batch processing — whole folders at once',
      'Multi-thread engine for max speed',
      'Advanced export presets',
      'Priority email support',
    ],
  },
  {
    name: 'Business',
    tagline: 'Licensing for teams & commercial use.',
    monthly: 20,
    yearly: 192,
    cta: 'Contact sales',
    features: [
      'Everything in Pro',
      'Commercial-use license',
      'Volume & seat licensing',
      'Deploy on-prem / air-gapped',
      'Centralized billing & invoicing',
      'Dedicated support & SLA',
    ],
  },
]

export function Pricing() {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-400">
          <Sparkles className="h-4 w-4" /> Simple, honest pricing
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Start free. Upgrade when you scale.
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          The full browser toolkit is free forever. Pro and Business add native apps, batch power
          and licensing for professional and commercial work.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Segmented
          value={cycle}
          onChange={setCycle}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly · save 33%' },
          ]}
        />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`card relative flex flex-col p-7 ${
              tier.highlight ? 'border-brand-500/40 shadow-glow ring-1 ring-brand-500/30' : ''
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className="text-xl font-bold text-white">{tier.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{tier.tagline}</p>

            <div className="mt-5 flex items-end gap-1.5">
              <span className="text-4xl font-black text-white">
                ${cycle === 'monthly' ? tier.monthly : Math.round(tier.yearly / 12)}
              </span>
              <span className="mb-1.5 text-sm text-slate-500">
                {tier.monthly === 0 ? 'forever' : '/ mo'}
              </span>
            </div>
            {tier.monthly > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {cycle === 'yearly' ? `Billed $${tier.yearly}/yr` : 'Billed monthly'}
                {tier.oneTime ? ` · or $${tier.oneTime} one-time license` : ''}
              </p>
            )}

            {tier.name === 'Business' ? (
              <a href="mailto:sales@vormexa.app?subject=Vormexa%20Business" className="mt-6">
                <Button variant={tier.highlight ? 'primary' : 'secondary'} className="w-full">
                  {tier.cta}
                </Button>
              </a>
            ) : (
              <Link to="/app" className="mt-6">
                <Button variant={tier.highlight ? 'primary' : 'secondary'} className="w-full">
                  {tier.cta}
                </Button>
              </Link>
            )}

            <ul className="mt-7 flex flex-col gap-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-400" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <FAQ />
    </div>
  )
}

const FAQS = [
  {
    q: 'Is the free version really free?',
    a: 'Yes. Every tool in the browser app is free to use with no watermarks, no sign-up and no file-size limits beyond your device memory. Paid plans add native desktop apps and batch/commercial features.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'Never. All processing happens locally in your browser (or the desktop app) using WebAssembly. Your files are physically incapable of leaving your device — you can confirm it in your network tab.',
  },
  {
    q: 'What do the Pro desktop apps add?',
    a: 'Native Mac & Windows apps, drag-a-folder batch processing, the multi-threaded engine for maximum speed, reusable export presets, and priority support.',
  },
  {
    q: 'Can I use Vormexa commercially?',
    a: 'The Business plan includes a commercial-use license, seat/volume licensing, on-prem deployment and invoicing — ideal for agencies, studios and teams.',
  },
  {
    q: 'Do I need an internet connection?',
    a: 'Only to load the app the first time. After that it works fully offline — install it as an app and edit on a plane if you like.',
  },
]

function FAQ() {
  return (
    <section className="mx-auto mt-20 max-w-3xl">
      <h2 className="text-center text-2xl font-bold text-white">Frequently asked questions</h2>
      <div className="mt-8 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
        {FAQS.map((item) => (
          <details key={item.q} className="group bg-ink-900/40 p-5 open:bg-ink-900/70">
            <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium text-slate-100">
              {item.q}
              <span className="ml-4 text-slate-500 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
