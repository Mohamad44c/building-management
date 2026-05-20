import type { CollectionBeforeChangeHook } from 'payload'
import { effectiveAmountPaid, roundCents } from '@/lib/dieselExpenseBalance'

type DieselDoc = {
  pricePerThousandLiters?: number | null
  liters?: number | null
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

const resolveTotalAmount = (data: DieselDoc, originalDoc: DieselDoc | undefined): number => {
  const fromData = roundCents(Number(data?.totalAmount))
  if (Number.isFinite(fromData) && fromData > 0) {
    return fromData
  }
  const price = Number(data?.pricePerThousandLiters ?? originalDoc?.pricePerThousandLiters ?? 0)
  const liters = Number(data?.liters ?? originalDoc?.liters ?? 0)
  if (price > 0 && liters > 0) {
    return roundCents((price / 1000) * liters)
  }
  return roundCents(Number(originalDoc?.totalAmount) || 0)
}

const hasExplicitAmountPaid = (incoming: DieselDoc): boolean =>
  incoming !== null &&
  typeof incoming === 'object' &&
  'amountPaid' in incoming &&
  incoming.amountPaid !== undefined &&
  incoming.amountPaid !== null

/**
 * Keeps `amountPaid` within [0, total], syncs `isPaid` when fully settled,
 * and supports "mark paid" by setting `isPaid: true` without sending `amountPaid`.
 */
export const syncDieselPaymentFields: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const incoming = data as DieselDoc
  const orig = originalDoc as DieselDoc | undefined

  const total = resolveTotalAmount(incoming, orig)

  let paid: number
  if (hasExplicitAmountPaid(incoming)) {
    paid = Number(incoming.amountPaid)
  } else if (incoming.isPaid === false && orig?.isPaid === true) {
    // Fully settled invoice reopened via checkbox (no new amount paid in this save).
    paid = 0
  } else {
    paid = effectiveAmountPaid({
      totalAmount: total,
      amountPaid: orig?.amountPaid,
      isPaid: orig?.isPaid,
    })
  }

  if (incoming.isPaid === true && paid < total) {
    paid = total
  }

  if (!Number.isFinite(paid)) {
    paid = 0
  }
  paid = Math.max(0, Math.min(roundCents(paid), total))

  incoming.amountPaid = paid
  incoming.isPaid = total > 0 && paid >= total

  return incoming
}
