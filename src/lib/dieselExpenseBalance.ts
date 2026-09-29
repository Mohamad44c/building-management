type DieselPayableDoc = {
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

export type { DieselPayableDoc }
export const roundCents = (n: number): number => Math.round(n * 100) / 100

/**
 * Effective amount already paid toward the invoice.
 * `isPaid === true` always means fully paid: legacy rows created before `amountPaid` existed were
 * backfilled with the column default (0) while `isPaid` is true, so `amountPaid` can't be trusted
 * for them. Otherwise uses `amountPaid`, clamped to [0, total].
 */
export function effectiveAmountPaid(doc: DieselPayableDoc): number {
  const total = roundCents(Number(doc.totalAmount) || 0)
  if (doc.isPaid === true) {
    return total
  }
  const raw = doc.amountPaid
  if (raw != null && Number.isFinite(Number(raw))) {
    return roundCents(Math.min(Math.max(0, Number(raw)), total))
  }
  return 0
}

export function remainingBalance(doc: DieselPayableDoc): number {
  const total = roundCents(Number(doc.totalAmount) || 0)
  return Math.max(0, roundCents(total - effectiveAmountPaid(doc)))
}

/**
 * Resolves `amountPaid`/`isPaid` for a save, given the (already recomputed) total.
 *
 * The admin form submits every field on each save, so `isPaid`/`amountPaid` being present doesn't
 * mean the user changed them. Intent is read from what actually differs from `orig`:
 * - `amountPaid` edited → use it.
 * - `isPaid` ticked (false → true) → fully paid at the new total.
 * - `isPaid` unticked (true → false) without editing the amount → reopened, amountPaid 0.
 * - otherwise → keep what was already paid; if the total grew, the invoice becomes partial.
 */
export function resolvePaidState(
  total: number,
  incoming: DieselPayableDoc,
  orig: DieselPayableDoc | undefined,
): { amountPaid: number; isPaid: boolean } {
  const wasPaid = orig?.isPaid === true
  const hasIncomingAmount = incoming.amountPaid !== undefined && incoming.amountPaid !== null
  const amountEdited =
    hasIncomingAmount &&
    roundCents(Number(incoming.amountPaid)) !== roundCents(Number(orig?.amountPaid ?? 0))

  let paid: number
  if (amountEdited) {
    paid = Number(incoming.amountPaid)
  } else if (incoming.isPaid === false && wasPaid) {
    paid = 0
  } else {
    paid = orig ? effectiveAmountPaid(orig) : 0
  }

  if (incoming.isPaid === true && !wasPaid) {
    paid = total
  }

  if (!Number.isFinite(paid)) {
    paid = 0
  }
  paid = Math.max(0, Math.min(roundCents(paid), total))

  return { amountPaid: paid, isPaid: total > 0 && paid >= total }
}
