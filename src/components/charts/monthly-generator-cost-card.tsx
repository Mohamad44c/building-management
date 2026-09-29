'use client'

import { HandCoins } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import type { MonthlyGeneratorCost } from '@/lib/dashboardMetrics'
import { formatCurrency, formatMonthKey } from '@/lib/format'

export function MonthlyGeneratorCostCard({ data, loading }: { data?: MonthlyGeneratorCost; loading: boolean }) {
  const months = data?.months ?? []
  const range =
    months.length > 1 ? `${formatMonthKey(months[0])} – ${formatMonthKey(months[months.length - 1])}` : months[0] && formatMonthKey(months[0])

  return (
    <StatCard
      label="Generator cost to cover / month"
      icon={HandCoins}
      loading={loading}
      value={data && (data.amount !== null ? formatCurrency(data.amount) : '—')}
      hint={
        data &&
        (data.amount !== null
          ? `Average diesel + maintenance over ${range}. Excludes general building expenses.`
          : 'Needs at least one completed month of generator records.')
      }
    />
  )
}
