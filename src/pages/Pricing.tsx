import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { lemon, paymentsConfigured, PRO_PRICE } from '@/config'

type TierKind = 'free' | 'pro'

interface Tier {
  name: string
  kind: TierKind
  tagline: string
  price: string
  unit: string
  note?: string
  cta: string
  highlight?: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    kind: 'free',
    tagline: 'Everything you need to get started.',
    price: '0',
    unit: 'forever',
    cta: 'Open the app',
    features: [
      'All 20+ browser tools',
      'Video, photo, audio & PDF',
      'Up to 3 files per job',
      '100% on-device & private',
      'No watermarks',
      'Works offline (PWA)',
    ],
  },
  {
    name: 'Pro',
    kind: 'pro',
    tagline: 'Pay once. Yours forever.',
    price: PRO_PRICE.toFixed(2),
    unit: 'one-time',
    note: 'One payment · no subscription',
    cta: 'Get Pro',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited files per job',
      'Batch processing — whole folders at once',
      'Native Mac & Windows apps (coming soon)',
      'Multi-thread engine for max speed',
      'Advanced export presets',
      'Priority email support',
    ],
  },
]

export function Pricing() {
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-400">
          <Sparkles className="h-4 w-4" /> Simple, honest pricing
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Free to use. $4.99 to own it all.
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          The full browser toolkit is free forever. Unlock unlimited batch power with a single
          one-time payment — no subscription, no recurring charges, ever.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`card relative flex flex-col p-7 ${
              tier.highlight ? 'border-brand-500/40 shadow-glow ring-1 ring-brand-500/30' : ''
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white">
                Best value
              </span>
            )}
            <h3 className="text-xl font-bold text-white">{tier.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{tier.tagline}</p>

            <div className="mt-5 flex items-end gap-1.5">
              <span className="text-4xl font-black text-white">${tier.price}</span>
              <span className="mb-1.5 text-sm text-slate-500">{tier.unit}</span>
            </div>
            <p className="mt-1 h-4 text-xs text-slate-500">{tier.note ?? ''}</p>

            <TierCta tier={tier} />

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

function TierCta({ tier }: { tier: Tier }) {
  const variant = tier.highlight ? 'primary' : 'secondary'
  const className = 'mt-6'

  if (tier.kind === 'free') {
    return (
      <Link to="/app" className={className}>
        <Button variant={variant} className="w-full">
          {tier.cta}
        </Button>
      </Link>
    )
  }

  // Pro → hosted checkout when configured, otherwise the in-app activation page.
  if (paymentsConfigured) {
    return (
      <a href={lemon.checkoutUrl} target="_blank" rel="noopener noreferrer" className={className}>
        <Button variant={variant} className="w-full">
          {tier.cta}
        </Button>
      </a>
    )
  }
  return (
    <Link to="/app/account" className={className}>
      <Button variant={variant} className="w-full">
        {tier.cta}
      </Button>
    </Link>
  )
}

const FAQS = [
  {
    q: 'Is the free version really free?',
    a: 'Yes. Every tool in the browser app is free with no watermarks, no sign-up and no file-size limits beyond your device memory. Free handles up to 3 files per job; Pro unlocks unlimited batch.',
  },
  {
    q: 'Is Pro a subscription?',
    a: 'No — Pro is a one-time $4.99 purchase. Pay once and it is yours forever, including future updates and the native desktop apps when they launch. No recurring charges.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'Never. All processing happens locally in your browser (or the desktop app) using WebAssembly. Your files are physically incapable of leaving your device — you can confirm it in your network tab.',
  },
  {
    q: 'Do I need an internet connection?',
    a: 'Only to load the app the first time and to activate your Pro license once. After that everything — including Pro — works fully offline, forever. Your files never leave your device.',
  },
  {
    q: 'How do I unlock Pro after buying?',
    a: "You'll get a license key by email. Paste it into the app once (Account → Activate) and Pro stays unlocked on that device — no account needed.",
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
              <span className="ml-4 text-slate-500 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
