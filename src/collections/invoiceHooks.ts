import type { CollectionBeforeChangeHook } from 'payload'
import { resolvePaidState } from '@/lib/dieselExpenseBalance'
import { buildFixedLineItems, sumLineItems, type InvoiceLineItem } from '@/lib/invoiceCalc'

type InvoiceDoc = {
  tenant?: number | string | { id: number | string } | null
  building?: number | string | { id: number | string } | null
  lineItems?: InvoiceLineItem[] | null
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

/**
 * Snapshots fixed tenant fee line items on create (never re-derived on update, so
 * historical figures don't shift if the tenant's fees change later), keeps
 * `totalAmount` in sync with `lineItems`, and resolves amountPaid/isPaid the same way as
 * DieselExpenses (`resolvePaidState`).
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

  const { amountPaid, isPaid } = resolvePaidState(total, incoming, orig)
  incoming.amountPaid = amountPaid
  incoming.isPaid = isPaid

  return incoming
}
