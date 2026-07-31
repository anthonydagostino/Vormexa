import { Link } from 'react-router-dom'
import { KeyRound, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { lemon, paymentsConfigured, PRO_PRICE } from '@/config'

/**
 * Shown in place of the run button when a Free user hits a Pro-only capability.
 * Doubles as the main upsell surface inside the tools.
 */
export function UpgradeGate({ title, benefit }: { title: string; benefit: string }) {
  const buy = paymentsConfigured ? lemon.checkoutUrl : '/pricing'
  const external = paymentsConfigured

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/15 via-ink-900 to-accent-500/10 p-6">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
        <Sparkles className="h-3.5 w-3.5" /> Pro feature
      </div>
      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
        <Zap className="h-5 w-5 text-brand-300" /> {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-300">{benefit}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {external ? (
          <a href={buy} target="_blank" rel="noopener noreferrer" className="sm:flex-1">
            <Button className="w-full">Unlock Pro — ${PRO_PRICE} one-time</Button>
          </a>
        ) : (
          <Link to={buy} className="sm:flex-1">
            <Button className="w-full">See Pro plans</Button>
          </Link>
        )}
        <Link to="/app/account" className="sm:flex-1">
          <Button variant="outline" icon={<KeyRound className="h-4 w-4" />} className="w-full">
            I have a license key
          </Button>
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Everyday single-file tasks stay free, forever. Pro unlocks bulk & batch power.
      </p>
    </div>
  )
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-brand-gradient px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${className ?? ''}`}
    >
      <Sparkles className="h-2.5 w-2.5" /> Pro
    </span>
  )
}
