'use client'

import { AlertTriangle, HandCoins, Receipt, Scale } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { Progress } from '@/components/ui/progress'
import type { RentCollectionSummary } from '@/lib/dashboardMetrics'
import { formatCurrency, formatPercent } from '@/lib/format'

export function RentCollectionSummaryCards({ data, loading }: { data?: RentCollectionSummary; loading: boolean }) {
  const rate = data?.collectionRatePct ?? null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Billed"
        icon={Receipt}
        loading={loading}
        value={data && formatCurrency(data.totalBilled)}
        hint={data && `${data.invoiceCount} invoice${data.invoiceCount === 1 ? '' : 's'} for these billing months`}
      />
      <StatCard
        label="Collected"
        icon={HandCoins}
        loading={loading}
        value={data && formatCurrency(data.totalCollected)}
        hint={data && (rate !== null ? `${formatPercent(rate)} of billed` : 'Nothing billed yet')}
        footer={
          rate !== null && (
            <Progress value={Math.min(100, rate)} className="mt-1 h-1.5" aria-label={`${formatPercent(rate)} collected`} />
          )
        }
      />
      <StatCard
        label="Outstanding"
        icon={Scale}
        loading={loading}
        value={data && formatCurrency(data.outstanding)}
        hint="Billed minus collected on these invoices"
      />
      <StatCard
        label="Overdue"
        icon={AlertTriangle}
        loading={loading}
        value={
          data && (
            <span className={data.overdueAmount > 0 ? 'text-red-600 dark:text-red-400' : undefined}>
              {formatCurrency(data.overdueAmount)}
            </span>
          )
        }
        hint={
          data &&
          (data.overdueCount > 0
            ? `${data.overdueCount} invoice${data.overdueCount === 1 ? '' : 's'} past due with a balance`
            : 'No invoices past due')
        }
      />
    </div>
  )
}
