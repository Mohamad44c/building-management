'use client'

import { Banknote } from 'lucide-react'

import { SnapshotBadge } from '@/components/dashboard/panel'
import { StatCard } from '@/components/dashboard/stat-card'
import type { DieselOutstandingSummary } from '@/lib/dashboardMetrics'
import { formatCurrency } from '@/lib/format'

export function DieselOutstandingBalanceCard({ data, loading }: { data?: DieselOutstandingSummary; loading: boolean }) {
  return (
    <StatCard
      label="Owed to diesel supplier"
      badge={<SnapshotBadge />}
      icon={Banknote}
      loading={loading}
      value={
        data && (
          <span className={data.totalOwed > 0 ? 'text-amber-600 dark:text-amber-400' : undefined}>
            {formatCurrency(data.totalOwed)}
          </span>
        )
      }
      hint={
        data &&
        (data.unpaidInvoiceCount > 0
          ? `${data.unpaidInvoiceCount} diesel invoice${data.unpaidInvoiceCount === 1 ? '' : 's'} not fully paid (partial payments deducted)`
          : 'All diesel invoices are settled')
      }
    />
  )
}
