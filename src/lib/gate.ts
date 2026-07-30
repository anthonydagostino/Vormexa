/**
 * Pure paywall logic, extracted so it can be unit-tested independently of the
 * React tree. A job is "batch gated" when it processes more than the free
 * allowance and the user isn't Pro.
 */
export function isBatchGated(
  fileCount: number,
  proAboveCount: number | undefined,
  isPro: boolean,
): boolean {
  if (proAboveCount == null) return false
  if (isPro) return false
  return fileCount > proAboveCount
}
