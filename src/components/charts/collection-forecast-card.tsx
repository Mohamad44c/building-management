'use client'

import { TrendingUp } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import type { RentCollectionForecast } from '@/lib/dashboardMetrics'
import { formatCurrency, formatMonthKey, formatPercent } from '@/lib/format'

export function CollectionForecastCard({ data, loading }: { data?: RentCollectionForecast; loading: boolean }) {
  const last = data?.history[data.history.length - 1]

  return (
    <StatCard
      label={data ? `Expected collection · ${formatMonthKey(data.targetMonth)}` : 'Expected collection'}
      icon={TrendingUp}
      loading={loading}
      value={data && (data.projectedCollection !== null ? formatCurrency(data.projectedCollection) : '—')}
      hint={
        data &&
        (data.projectedCollection !== null
          ? `Billed trend over ${data.monthsUsed} completed month${data.monthsUsed === 1 ? '' : 's'}${
              data.collectionRate !== null ? ` × ${formatPercent(data.collectionRate * 100)} typical collection rate` : ''
            }${
              last ? `; ${formatMonthKey(last.month)} collected ${formatCurrency(last.collected)} of ${formatCurrency(last.billed)} so far` : ''
            }.`
          : 'Needs at least one completed billing month.')
      }
    />
  )
}
