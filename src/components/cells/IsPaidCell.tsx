'use client'

import { effectiveAmountPaid, remainingBalance, roundCents } from '@/lib/dieselExpenseBalance'

type DieselRow = {
  totalAmount?: number | null
  amountPaid?: number | null
  isPaid?: boolean | null
}

export const IsPaidCell: React.FC<{ cellData?: boolean; rowData?: DieselRow }> = ({ rowData }) => {
  if (!rowData) {
    return <span className="text-muted-foreground">—</span>
  }

  const total = roundCents(Number(rowData.totalAmount) || 0)
  if (total <= 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const rem = remainingBalance(rowData)
  if (rem <= 0) {
    return <span className="text-green-600 dark:text-green-400">Paid</span>
  }

  const paid = effectiveAmountPaid(rowData)
  if (paid > 0) {
    return (
      <span className="text-amber-600 dark:text-amber-400" title={`${paid.toFixed(2)} / ${total.toFixed(2)} USD`}>
        Partial
      </span>
    )
  }

  return <span className="text-muted-foreground">Unpaid</span>
}
