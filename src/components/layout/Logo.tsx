import { cn } from '@/lib/cn'

/** Vormexa wordmark glyph — the gradient "V". */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-8 w-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id="vormexa-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="0.55" stopColor="#6366f1" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#vormexa-logo)" />
      <path d="M16 18 L28 46 L36 46 L48 18 L40.5 18 L32 39 L23.5 18 Z" fill="#fff" />
    </svg>
  )
}
