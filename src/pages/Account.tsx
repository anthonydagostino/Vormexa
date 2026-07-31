import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, ExternalLink, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { Button, Field } from '@/components/ui/primitives'
import { ProBadge } from '@/components/pro/UpgradeGate'
import { useLicense } from '@/store/license'
import { lemon, paymentsConfigured, PRO_PRICE } from '@/config'

export function Account() {
  const { key, status, valid, activatedAt } = useLicense()
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link to="/app" className="mb-5 inline-block text-sm text-slate-400 hover:text-slate-200">
        ← All tools
      </Link>
      <h1 className="text-2xl font-bold text-white">Account & license</h1>
      <p className="mt-1 text-sm text-slate-400">Manage your Vormexa Pro license on this device.</p>

      <div className="mt-6">{valid ? <ProPanel /> : <FreePanel />}</div>

      {valid && (
        <div className="mt-4 space-y-1 rounded-2xl border border-white/5 bg-ink-900/50 p-5 text-sm text-slate-400">
          <Row
            label="Status"
            value={<span className="capitalize text-emerald-300">{status ?? 'active'}</span>}
          />
          <Row label="License key" value={<code className="text-slate-300">{maskKey(key)}</code>} />
          {activatedAt && (
            <Row label="Activated" value={new Date(activatedAt).toLocaleDateString()} />
          )}
        </div>
      )}
    </div>
  )
}

function ProPanel() {
  const deactivate = useLicense((s) => s.deactivate)
  const [busy, setBusy] = useState(false)
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6">
      <div className="flex items-center gap-2 text-emerald-300">
        <BadgeCheck className="h-5 w-5" />
        <span className="text-lg font-bold text-white">Vormexa Pro</span>
        <ProBadge />
      </div>
      <p className="mt-2 text-sm text-slate-300">
        You're all set — batch processing and every Pro feature are unlocked on this device.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {lemon.customerPortalUrl && (
          <a href={lemon.customerPortalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" />}>
              Manage subscription
            </Button>
          </a>
        )}
        <Button
          variant="outline"
          loading={busy}
          onClick={async () => {
            setBusy(true)
            await deactivate()
            setBusy(false)
          }}
        >
          Deactivate on this device
        </Button>
      </div>
    </div>
  )
}

function FreePanel() {
  const activate = useLicense((s) => s.activate)
  const [keyInput, setKeyInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buy = paymentsConfigured ? lemon.checkoutUrl : '/pricing'

  const onActivate = async () => {
    setBusy(true)
    setError(null)
    const res = await activate(keyInput)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Activation failed.')
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-600/15 to-accent-500/10 p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
          <Sparkles className="h-3.5 w-3.5" /> You're on the Free plan
        </div>
        <h2 className="mt-3 text-xl font-bold text-white">Unlock Vormexa Pro</h2>
        <p className="mt-1.5 text-sm text-slate-300">
          Unlimited batch & bulk processing, advanced presets and priority support — just $
          {PRO_PRICE.monthly}/mo.
        </p>
        {paymentsConfigured ? (
          <a href={buy} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <Button>Get Pro</Button>
          </a>
        ) : (
          <Link to="/pricing" className="mt-4 inline-block">
            <Button>See Pro plans</Button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-ink-900/50 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <KeyRound className="h-4 w-4 text-brand-300" /> Activate a license key
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Bought Pro already? Paste the key from your email receipt.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Field className="flex-1">
            <input
              className="input font-mono"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onActivate()}
            />
          </Field>
          <Button onClick={onActivate} disabled={busy || !keyInput.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function maskKey(key: string | null): string {
  if (!key) return '—'
  if (key.length <= 8) return key
  return `${key.slice(0, 4)}····${key.slice(-4)}`
}
