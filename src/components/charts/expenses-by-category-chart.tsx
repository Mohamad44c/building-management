'use client'

import { Wallet } from 'lucide-react'

import { BarList, type BarListItem } from '@/components/dashboard/bar-list'
import { Panel, type PanelStatus } from '@/components/dashboard/panel'
import type { ExpensesByCategory } from '@/lib/dashboardMetrics'
import { formatCurrency } from '@/lib/format'

const MAX_ROWS = 7

type Props = { data?: ExpensesByCategory; status: PanelStatus; onRetry?: () => void; className?: string }

export function ExpensesByCategoryChart({ data, status, onRetry, className }: Props) {
  const categories = data?.categories ?? []
  const empty = status === 'ready' && categories.length === 0

  // Long tails fold into "Other" so the list stays scannable.
  const items: BarListItem[] = categories.slice(0, MAX_ROWS).map((c) => ({
    id: c.id,
    label: c.name,
    value: c.totalAmount,
    muted: c.id === 'uncategorized',
  }))
  const rest = categories.slice(MAX_ROWS)
  if (rest.length > 0) {
    items.push({
      id: 'other',
      label: `Other (${rest.length} categories)`,
      value: rest.reduce((sum, c) => sum + c.totalAmount, 0),
      muted: true,
    })
  }

  return (
    <Panel
      title="Building expenses by category"
      description={
        data && categories.length > 0 ? (
          <>
            <span className="font-semibold text-foreground">{formatCurrency(data.grandTotal)}</span> in general
            expenses (excludes generator & diesel).
          </>
        ) : (
          'General expenses, excluding generator & diesel.'
        )
      }
      icon={Wallet}
      status={empty ? 'empty' : status}
      onRetry={onRetry}
      emptyMessage="No expenses recorded in this period."
      bodyClassName="min-h-[180px]"
      className={className}
    >
      <BarList items={items} format={formatCurrency} barClassName="bg-[#4a3aa7] dark:bg-[#9085e9]" />
    </Panel>
  )
}
