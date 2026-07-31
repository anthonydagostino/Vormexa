import { Link } from 'react-router-dom'
import { Check, Monitor, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { CONTACT_EMAIL, DESKTOP_PRICE, lemon, paymentsConfigured, PRO_PRICE } from '@/config'

type TierKind = 'free' | 'pro' | 'desktop'

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
    tagline: 'For creators who live in their media.',
    price: PRO_PRICE.monthly.toFixed(2),
    unit: '/ mo',
    note: 'Billed monthly · cancel anytime',
    cta: 'Get Pro',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited files per job',
      'Batch processing — whole folders at once',
      'Multi-thread engine for max speed',
      'Advanced export presets',
      'Priority email support',
    ],
  },
  {
    name: 'Desktop',
    kind: 'desktop',
    tagline: 'Own it forever. No subscription.',
    price: DESKTOP_PRICE.toFixed(2),
    unit: 'one-time',
    note: 'Mac & Windows · mobile coming soon',
    cta: 'Get notified',
    features: [
      'Everything in Pro',
      'Native Mac & Windows apps',
      'One payment — yours to keep',
      'Works 100% offline, forever',
      'Full-speed native engine',
      'Free updates',
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
          Start free. Go Pro when you need more.
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          The full browser toolkit is free forever. Go Pro for unlimited batch power on the web, or
          buy the desktop app once and own it for good.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
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
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              {tier.kind === 'desktop' && <Monitor className="h-5 w-5 text-accent-400" />}
              {tier.name}
            </h3>
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

  // Desktop apps aren't released yet — capture interest instead of a dead link.
  if (tier.kind === 'desktop') {
    return (
      <a href={`mailto:${CONTACT_EMAIL}?subject=Vormexa%20Desktop%20app`} className={className}>
        <Button variant="secondary" className="w-full">
          {tier.cta}
        </Button>
      </a>
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
    q: 'Are my files uploaded anywhere?',
    a: 'Never. All processing happens locally in your browser (or the desktop app) using WebAssembly. Your files are physically incapable of leaving your device — you can confirm it in your network tab.',
  },
  {
    q: "What's the difference between Pro and the Desktop app?",
    a: 'Pro is a $4.99/month subscription that unlocks unlimited batch processing in your web browser. The Desktop app is a one-time $14.99 purchase you own forever — native Mac & Windows apps that run fully offline with a faster native engine. Buy whichever fits how you work.',
  },
  {
    q: 'Do I need an internet connection?',
    a: 'The free tools and the one-time desktop app work fully offline. The web Pro subscription needs to reach the internet occasionally to confirm your subscription is active — but it never sends your files, only checks your license.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. The Pro subscription can be cancelled at any time from your receipt, and the one-time desktop purchase is yours to keep with no recurring charge.',
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
