import type { CollectionBeforeChangeHook } from 'payload'
import { effectiveAmountPaid, roundCents } from '@/lib/dieselExpenseBalance'
import { buildFixedLineItems, sumLineItems, type InvoiceLineItem } from '@/lib/invoiceCalc'

type InvoiceDoc = {
  tenant?: number | string | { id: number | string } | null
  building?: number | string | { id: number | string } | null
  lineItems?: InvoiceLineItem[] | null
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

const hasExplicitAmountPaid = (incoming: InvoiceDoc): boolean =>
  incoming !== null &&
  typeof incoming === 'object' &&
  'amountPaid' in incoming &&
  incoming.amountPaid !== undefined &&
  incoming.amountPaid !== null

/**
 * Snapshots fixed tenant fee line items on create (never re-derived on update, so
 * historical figures don't shift if the tenant's fees change later), keeps
 * `totalAmount` in sync with `lineItems`, and applies the same amountPaid/isPaid
 * clamp pattern used by DieselExpenses' syncDieselPaymentFields.
 */
export const syncInvoicePaymentFields: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const incoming = data as InvoiceDoc
  const orig = originalDoc as InvoiceDoc | undefined

  const incomingTenantId =
    typeof incoming.tenant === 'object' ? incoming.tenant?.id : incoming.tenant
  const origTenantId = typeof orig?.tenant === 'object' ? orig.tenant?.id : orig?.tenant
  const tenantChanged = incoming.tenant !== undefined && incomingTenantId !== origTenantId

  // Keep `building` in sync with `tenant` on create, whenever the tenant changes, or
  // whenever it's missing (self-heals older records saved before this hook existed).
  if (incomingTenantId && (operation === 'create' || tenantChanged || !incoming.building)) {
    const tenant = await req.payload.findByID({
      collection: 'tenants',
      id: incomingTenantId,
      depth: 0,
    })
    incoming.building = tenant.building as InvoiceDoc['building']

    if (operation === 'create') {
      const fixed = buildFixedLineItems(tenant)
      const adhoc = (incoming.lineItems ?? []).filter((item) => item.kind !== 'fixed')
      incoming.lineItems = [...fixed, ...adhoc]
    }
  }

  const lineItems = (incoming.lineItems ?? orig?.lineItems ?? []) as InvoiceLineItem[]
  const total = sumLineItems(lineItems)
  incoming.totalAmount = total

  let paid: number
  if (hasExplicitAmountPaid(incoming)) {
    paid = Number(incoming.amountPaid)
  } else if (incoming.isPaid === false && orig?.isPaid === true) {
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
