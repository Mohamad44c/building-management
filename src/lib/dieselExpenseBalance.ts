type DieselPayableDoc = {
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

export type { DieselPayableDoc }
export const roundCents = (n: number): number => Math.round(n * 100) / 100

/**
 * Effective amount already paid toward the invoice.
 * Prefers `amountPaid` when present; otherwise infers from legacy `isPaid === true` (full invoice).
 */
export function effectiveAmountPaid(doc: DieselPayableDoc): number {
  const total = roundCents(Number(doc.totalAmount) || 0)
  const raw = doc.amountPaid
  if (raw != null && Number.isFinite(Number(raw))) {
    return roundCents(Math.min(Math.max(0, Number(raw)), total))
  }
  if (doc.isPaid === true) {
    return total
  }
  return 0
}

export function remainingBalance(doc: DieselPayableDoc): number {
  const total = roundCents(Number(doc.totalAmount) || 0)
  return Math.max(0, roundCents(total - effectiveAmountPaid(doc)))
}
