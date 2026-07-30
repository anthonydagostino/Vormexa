/**
 * Product & monetization configuration.
 *
 * Payments are handled by Lemon Squeezy (a Merchant-of-Record — it collects
 * global sales tax/VAT for us and issues license keys), so Vormexa stays 100%
 * backend-free: the app validates license keys directly against Lemon Squeezy's
 * public license API. Fill these in via environment variables at build time —
 * see .env.example.
 */

export const PRO_PRICE = {
  monthly: 6,
  yearly: 48, // ~$4/mo billed annually
  lifetime: 79,
}

export const lemon = {
  /** Hosted checkout URL for the Pro plan (Lemon Squeezy "Share / buy" link). */
  checkoutUrl: (import.meta.env.VITE_LS_CHECKOUT_URL as string | undefined) ?? '',
  /** Store name, shown in a few places. */
  storeName: (import.meta.env.VITE_LS_STORE_NAME as string | undefined) ?? 'Vormexa',
  /** Where buyers manage their subscription / receipts. */
  customerPortalUrl: (import.meta.env.VITE_LS_PORTAL_URL as string | undefined) ?? '',
}

/** True once a real checkout link is configured. */
export const paymentsConfigured = Boolean(lemon.checkoutUrl)

/** Free plan allows small jobs; Pro unlocks bulk/batch. */
export const FREE_BATCH_LIMIT = 3

/** Sales/support contact for the Business tier. */
export const CONTACT_EMAIL = 'sales@vormexa.app'
