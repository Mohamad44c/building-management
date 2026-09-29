import type { CollectionBeforeChangeHook } from 'payload'
import { resolvePaidState, roundCents } from '@/lib/dieselExpenseBalance'

type DieselDoc = {
  pricePerThousandLiters?: number | null
  liters?: number | null
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

/**
 * Price × liters wins over any `totalAmount` in the payload: this collection hook runs before the
 * field-level hook that recomputes `totalAmount`, so `data.totalAmount` is the previous (stale)
 * value whenever price or liters were just edited.
 */
const resolveTotalAmount = (data: DieselDoc, originalDoc: DieselDoc | undefined): number => {
  const price = Number(data?.pricePerThousandLiters ?? originalDoc?.pricePerThousandLiters ?? 0)
  const liters = Number(data?.liters ?? originalDoc?.liters ?? 0)
  if (price > 0 && liters > 0) {
    return roundCents((price / 1000) * liters)
  }
  const fromData = roundCents(Number(data?.totalAmount))
  if (Number.isFinite(fromData) && fromData > 0) {
    return fromData
  }
  return roundCents(Number(originalDoc?.totalAmount) || 0)
}

/**
 * Keeps `amountPaid` within [0, total] and `isPaid` in sync with it; see `resolvePaidState`.
 */
export const syncDieselPaymentFields: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const incoming = data as DieselDoc
  const total = resolveTotalAmount(incoming, originalDoc as DieselDoc | undefined)

  const { amountPaid, isPaid } = resolvePaidState(total, incoming, originalDoc as DieselDoc | undefined)
  incoming.amountPaid = amountPaid
  incoming.isPaid = isPaid

  return incoming
}
