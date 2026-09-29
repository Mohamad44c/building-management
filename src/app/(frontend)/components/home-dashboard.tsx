'use client'

import { useState } from 'react'

import { CollectionForecastCard } from '@/components/charts/collection-forecast-card'
import { DieselOutstandingBalanceCard } from '@/components/charts/diesel-outstanding-balance-card'
import { DieselPriceForecastCard } from '@/components/charts/diesel-price-forecast-card'
import { DieselPricePerLiterChart } from '@/components/charts/diesel-price-per-liter-chart'
import { ExpensesByCategoryChart } from '@/components/charts/expenses-by-category-chart'
import { GeneratorHoursByDayChart } from '@/components/charts/generator-hours-by-day-chart'
import { GeneratorMaintenanceForecastCard } from '@/components/charts/generator-maintenance-forecast-card'
import { GeneratorStatCards } from '@/components/charts/generator-stat-cards'
import { MonthlyGeneratorCostCard } from '@/components/charts/monthly-generator-cost-card'
import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'
import { ReceivablesAgingChart } from '@/components/charts/receivables-aging-chart'
import { RentCollectionSummaryCards } from '@/components/charts/rent-collection-summary-cards'
import { TenantsByBuildingChart } from '@/components/charts/tenants-by-building-chart'
import { ErrorState, panelStatus } from '@/components/dashboard/panel'
import { useDashboardOverview, useDashboardPeriod } from '@/hooks/use-dashboard'
import { DEFAULT_DASHBOARD_FILTER, type DashboardDateFilterValue } from '@/lib/dashboardDateFilter'
import { cn } from '@/lib/utils'

import { DashboardHeader } from './dashboard-header'
import { DashboardSection } from './dashboard-section'

export function HomeDashboard() {
  const [filter, setFilter] = useState<DashboardDateFilterValue>(DEFAULT_DASHBOARD_FILTER)
  const period = useDashboardPeriod(filter)
  const overview = useDashboardOverview()

  const p = period.data
  const o = overview.data
  const periodLoading = p === undefined && !period.isError
  const overviewLoading = o === undefined && !overview.isError
  const periodStatus = panelStatus(period)
  const overviewStatus = panelStatus(overview)
  const retryPeriod = () => void period.refetch()
  const retryOverview = () => void overview.refetch()
  // While a new period loads, the previous one stays on screen, dimmed.
  const stale = period.isPlaceholderData

  const periodFailed = period.isError && p === undefined
  const periodNote = p?.window.isPartial ? 'Period in progress — compared with the same days before.' : undefined

  return (
    <>
      <DashboardHeader
        period={filter}
        onPeriodChange={setFilter}
        rangeLabel={p?.window.label}
        comparisonLabel={p?.window.comparisonLabel}
        isRefreshing={period.isFetching || overview.isFetching}
      />

      <div className="mx-auto w-full max-w-[1400px] space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {periodFailed ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <ErrorState message="Could not load data for this period." onRetry={retryPeriod} />
          </div>
        ) : null}

        <div className={cn('space-y-10 transition-opacity', stale && 'pointer-events-none opacity-60')} aria-busy={stale}>
          <DashboardSection
            title="Rent & collections"
            description="Invoices billed for the selected months and payments received."
            meta={periodNote}
          >
            <RentCollectionSummaryCards data={p?.rent} loading={periodLoading} />
            <div className="grid gap-4 lg:grid-cols-12">
              <PaymentsByBuildingChart
                data={p?.payments}
                status={periodStatus}
                onRetry={retryPeriod}
                className="lg:col-span-5"
              />
              <ReceivablesAgingChart
                data={o?.receivables}
                status={overviewStatus}
                onRetry={retryOverview}
                className="lg:col-span-7"
              />
            </div>
          </DashboardSection>

          <DashboardSection title="Generator & fuel" description="Diesel, runtime and generator costs for the selected period.">
            <GeneratorStatCards data={p?.generator} loading={periodLoading} />
            <div className="grid gap-4 lg:grid-cols-12">
              <GeneratorHoursByDayChart
                data={p?.generator.timeline}
                status={panelStatus(period, p?.generator.timeline.length === 0)}
                onRetry={retryPeriod}
                className="lg:col-span-7"
              />
              <DieselPricePerLiterChart
                data={p?.dieselPrices}
                status={panelStatus(period, p?.dieselPrices.length === 0)}
                onRetry={retryPeriod}
                className="lg:col-span-5"
              />
            </div>
          </DashboardSection>

          <DashboardSection title="Expenses & payables">
            <div className="grid gap-4 lg:grid-cols-12">
              <ExpensesByCategoryChart
                data={p?.expenses}
                status={periodStatus}
                onRetry={retryPeriod}
                className="lg:col-span-8"
              />
              <div className="lg:col-span-4">
                <DieselOutstandingBalanceCard data={o?.dieselOutstanding} loading={overviewLoading} />
              </div>
            </div>
          </DashboardSection>
        </div>

        <DashboardSection
          title="Buildings & outlook"
          description="Current tenants and trend-based estimates — directional guidance, not guarantees."
          meta="Not affected by the period filter"
        >
          {overview.isError && o === undefined ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <ErrorState message="Could not load the overview." onRetry={retryOverview} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CollectionForecastCard data={o?.rentForecast} loading={overviewLoading} />
              <MonthlyGeneratorCostCard data={o?.monthlyGeneratorCost} loading={overviewLoading} />
              <DieselPriceForecastCard data={o?.dieselPriceForecast} loading={overviewLoading} />
              <GeneratorMaintenanceForecastCard data={o?.maintenance} loading={overviewLoading} />
            </div>
          )}
          <TenantsByBuildingChart data={o?.tenants} status={overviewStatus} onRetry={retryOverview} />
        </DashboardSection>
      </div>
    </>
  )
}
