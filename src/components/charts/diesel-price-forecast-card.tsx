'use client'

import { Minus, TrendingDown, TrendingUp, Fuel } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import type { DieselPriceForecast } from '@/lib/dashboardMetrics'
import { formatDay, formatPricePerLiter } from '@/lib/format'
import { cn } from '@/lib/utils'

const trendMeta = {
  up: { label: 'Rising', Icon: TrendingUp, className: 'text-red-600 dark:text-red-400' },
  down: { label: 'Falling', Icon: TrendingDown, className: 'text-emerald-600 dark:text-emerald-400' },
  flat: { label: 'Stable', Icon: Minus, className: 'text-muted-foreground' },
}

export function DieselPriceForecastCard({ data, loading }: { data?: DieselPriceForecast; loading: boolean }) {
  const meta = data?.trend ? trendMeta[data.trend] : null

  return (
    <StatCard
      label="Next diesel delivery price"
      icon={Fuel}
      loading={loading}
      value={data && (data.projectedNextPrice !== null ? formatPricePerLiter(data.projectedNextPrice) : '—')}
      hint={
        data &&
        (data.projectedNextPrice !== null && data.lastPrice !== null && data.lastDeliveryDate
          ? `Trend of the last ${data.pointsUsed} deliveries. Last paid ${formatPricePerLiter(data.lastPrice)} on ${formatDay(data.lastDeliveryDate)}.`
          : 'Needs at least 3 priced deliveries.')
      }
      footer={
        meta && (
          <p className={cn('inline-flex items-center gap-1 text-xs font-medium', meta.className)}>
            <meta.Icon className="size-3.5" aria-hidden />
            {meta.label}
          </p>
        )
      }
    />
  )
}
