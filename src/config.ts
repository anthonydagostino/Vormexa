/**
 * Product & monetization configuration.
 *
 * Payments are handled by Lemon Squeezy (a Merchant-of-Record — it collects
 * global sales tax/VAT for us and issues license keys), so Vormexa stays 100%
 * backend-free: the app validates license keys directly against Lemon Squeezy's
 * public license API. Fill these in via environment variables at build time —
 * see .env.example.
 */

/** One-time price (USD) to unlock Vormexa Pro forever — all platforms, owned. */
export const PRO_PRICE = 4.99

export const lemon = {
  /**
   * Hosted checkout URL for the Pro plan (Lemon Squeezy "Share / buy" link).
   * This is a public link (meant to be shared), so it's safe to ship a default;
   * an env var can still override it per-environment.
   */
  checkoutUrl:
    (import.meta.env.VITE_LS_CHECKOUT_URL as string | undefined) ??
    'https://vormexa.lemonsqueezy.com/checkout/buy/e4dd44e2-2765-4a49-85e6-a640c8a128d2',
  /** Store name, shown in a few places. */
  storeName: (import.meta.env.VITE_LS_STORE_NAME as string | undefined) ?? 'Vormexa',
  /** Where buyers manage their subscription / receipts. */
  customerPortalUrl: (import.meta.env.VITE_LS_PORTAL_URL as string | undefined) ?? '',
}

/** True once a real checkout link is configured. */
export const paymentsConfigured = Boolean(lemon.checkoutUrl)

/** Free plan allows small jobs; Pro unlocks bulk/batch. */
export const FREE_BATCH_LIMIT = 3

/** Sales/support contact (used by the desktop "notify me" and support links). */
export const CONTACT_EMAIL = 'support@getvormexa.com'
