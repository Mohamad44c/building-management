'use client'

import { Fuel, Gauge, ReceiptText, Timer } from 'lucide-react'

import { Delta, StatCard } from '@/components/dashboard/stat-card'
import type { GeneratorDashboardStats } from '@/lib/generatorStats'
import { formatCurrency, formatHours, formatLiters } from '@/lib/format'

export function GeneratorStatCards({ data, loading }: { data?: GeneratorDashboardStats; loading: boolean }) {
  const current = data?.current
  const previous = data?.previous

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Generator cost"
        icon={ReceiptText}
        loading={loading}
        value={current && formatCurrency(current.totalGeneratorExpenses)}
        hint={
          current &&
          `Diesel ${formatCurrency(current.dieselSpent)} + maintenance ${formatCurrency(current.maintenanceCost)}`
        }
        footer={
          current &&
          previous && (
            <Delta current={current.totalGeneratorExpenses} previous={previous.totalGeneratorExpenses} format={formatCurrency} goodWhen="down" />
          )
        }
      />
      <StatCard
        label="Diesel invoiced"
        icon={Fuel}
        loading={loading}
        value={current && formatCurrency(current.dieselSpent)}
        hint={current && `${formatLiters(current.dieselLiters)} delivered (paid + unpaid)`}
        footer={
          current &&
          previous && <Delta current={current.dieselSpent} previous={previous.dieselSpent} format={formatCurrency} goodWhen="down" />
        }
      />
      <StatCard
        label="Generator runtime"
        icon={Timer}
        loading={loading}
        value={current && formatHours(current.generatorHours)}
        hint={current && `Ran on ${current.activeDays} day${current.activeDays === 1 ? '' : 's'}`}
        footer={
          current &&
          previous && <Delta current={current.generatorHours} previous={previous.generatorHours} format={formatHours} goodWhen="neutral" />
        }
      />
      <StatCard
        label="Cost per run-hour"
        icon={Gauge}
        loading={loading}
        value={current && (current.costPerHour !== null ? formatCurrency(current.costPerHour) : '—')}
        hint={
          current &&
          (current.costPerActiveDay !== null
            ? `${formatCurrency(current.costPerActiveDay)} per running day`
            : 'No runtime recorded in this period')
        }
        footer={
          current?.costPerHour != null &&
          previous?.costPerHour != null && (
            <Delta current={current.costPerHour} previous={previous.costPerHour} format={formatCurrency} goodWhen="down" />
          )
        }
      />
    </div>
  )
}
