export type InvoiceLineItem = {
  label: string
  amount: number
  kind: 'fixed' | 'adhoc'
}

type TenantForInvoice = {
  monthlyFee?: number | null
  buildingFee?: number | null
  pricePerAmp?: number | null
  ampsTaken?: number | null
  pastDueBalance?: number | null
}

export const roundCents = (n: number): number => Math.round(n * 100) / 100

/**
 * Builds the fixed line items snapshot from a tenant's current fee fields.
 * Omits zero/null items.
 */
export function buildFixedLineItems(tenant: TenantForInvoice): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = []

  const monthlyFee = Number(tenant.monthlyFee) || 0
  if (monthlyFee > 0) {
    items.push({ label: 'Monthly Fee', amount: roundCents(monthlyFee), kind: 'fixed' })
  }

  const buildingFee = Number(tenant.buildingFee) || 0
  if (buildingFee > 0) {
    items.push({ label: 'Building Fee', amount: roundCents(buildingFee), kind: 'fixed' })
  }

  const pastDue = Number(tenant.pastDueBalance) || 0
  if (pastDue > 0) {
    items.push({ label: 'Past Due Balance', amount: roundCents(pastDue), kind: 'fixed' })
  }

  return items
}

export function sumLineItems(items: InvoiceLineItem[]): number {
  return roundCents(items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))
}
