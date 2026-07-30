import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-ink-700 text-slate-100 hover:bg-ink-600',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
  outline: 'border border-white/15 bg-transparent text-slate-200 hover:bg-white/5',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn('btn', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
})

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('card p-5', className)}>{children}</div>
}

export function Badge({
  children,
  className,
  tone = 'brand',
}: {
  children: ReactNode
  className?: string
  tone?: 'brand' | 'accent' | 'neutral' | 'success' | 'warn'
}) {
  const tones = {
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/25',
    accent: 'bg-accent-500/15 text-accent-400 border-accent-500/25',
    neutral: 'bg-white/5 text-slate-300 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    warn: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-400', className)} />
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-ink-700', className)}>
      <div
        className="h-full rounded-full bg-brand-gradient transition-[width] duration-200 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn('input cursor-pointer pr-9', className)} {...props}>
        {children}
      </select>
    )
  },
)

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  className?: string
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-700 accent-brand-500',
        '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400',
        className,
      )}
    />
  )
}

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-xl bg-ink-800 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === opt.value
              ? 'bg-brand-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-ink-600',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  )
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  suffix,
  className,
}: {
  value: number | ''
  onChange: (v: number | '') => void
  placeholder?: string
  min?: number
  max?: number
  suffix?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="number"
        className="input"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  )
}
