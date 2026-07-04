'use client'

import { useState } from 'react'
import { Banknote, BarChart3, Building, Fuel, Gauge, HandCoins, TrendingUp } from 'lucide-react'

import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'
import { TenantsByBuildingChart } from '@/components/charts/tenants-by-building-chart'
import { DieselPricePerLiterChart } from '@/components/charts/diesel-price-per-liter-chart'
import { GeneratorHoursByDayChart } from '@/components/charts/generator-hours-by-day-chart'
import { GeneratorStatCards } from '@/components/charts/generator-stat-cards'
import { DieselOutstandingBalanceCard } from '@/components/charts/diesel-outstanding-balance-card'
import { RentCollectionSummaryCards } from '@/components/charts/rent-collection-summary-cards'
import { ReceivablesAgingChart } from '@/components/charts/receivables-aging-chart'
import { ExpensesByCategoryChart } from '@/components/charts/expenses-by-category-chart'
import { DieselPriceForecastCard } from '@/components/charts/diesel-price-forecast-card'
import { CollectionForecastCard } from '@/components/charts/collection-forecast-card'
import { GeneratorMaintenanceForecastCard } from '@/components/charts/generator-maintenance-forecast-card'
import { resolveDashboardDateWindow, type DashboardDateFilterValue } from '@/lib/dashboardDateFilter'

import { DashboardHero } from './dashboard-hero'
import { DashboardSection } from './dashboard-section'

const defaultFilter: DashboardDateFilterValue = {
  mode: 'preset',
  preset: 'this-month',
}

export function HomeDashboard() {
  const [filter, setFilter] = useState<DashboardDateFilterValue>(defaultFilter)
  const { start, end } = resolveDashboardDateWindow(filter)
  const startDate = start.toISOString()
  const endDate = end.toISOString()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 p-4 sm:space-y-12 sm:p-6 lg:space-y-14 lg:p-8">
      <DashboardHero period={filter} onPeriodChange={setFilter} />

      <DashboardSection
        title="Generator & fuel snapshot"
        description="Key diesel and runtime metrics for the selected period, at a glance."
        icon={Gauge}
        iconClassName="text-amber-600 dark:text-amber-400"
      >
        <GeneratorStatCards startDate={startDate} endDate={endDate} />
      </DashboardSection>

      <DashboardSection
        title="Forecasts & projections"
        description="Lightweight trend-based estimates from historical data — directional guidance, not guarantees."
        icon={TrendingUp}
        iconClassName="text-rose-600 dark:text-rose-400"
      >
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DieselPriceForecastCard />
          <CollectionForecastCard />
          <GeneratorMaintenanceForecastCard />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Buildings, cash flow & occupancy"
        description="Outstanding diesel balance alongside rent collection and tenant distribution by building."
        icon={Building}
        iconClassName="text-sky-600 dark:text-sky-400"
      >
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-10">
          <DieselOutstandingBalanceCard />
          <PaymentsByBuildingChart startDate={startDate} endDate={endDate} />
          <TenantsByBuildingChart />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Rent collection & receivables"
        description="Billed vs. collected rent for the selected period, plus how far outstanding balances are past due."
        icon={HandCoins}
        iconClassName="text-emerald-600 dark:text-emerald-400"
      >
        <div className="space-y-4 sm:space-y-5">
          <RentCollectionSummaryCards startDate={startDate} endDate={endDate} />
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-5">
            <ReceivablesAgingChart />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Costs, diesel trends & generator hours"
        description="Expense trends, fuel spend, price per liter, and daily generator activity for deeper operational insight."
        icon={BarChart3}
        iconClassName="text-violet-600 dark:text-violet-400"
      >
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-8">
          <DieselPricePerLiterChart startDate={startDate} endDate={endDate} />
          <ExpensesByCategoryChart startDate={startDate} endDate={endDate} />
          <GeneratorHoursByDayChart startDate={startDate} endDate={endDate} />
        </div>
      </DashboardSection>

      <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground sm:gap-3 sm:text-sm">
        <Fuel className="size-4 shrink-0 text-amber-600/80 dark:text-amber-400/80" aria-hidden />
        <span>Data reflects your configured reporting period and admin records.</span>
        <Banknote
          className="size-4 shrink-0 text-emerald-600/80 dark:text-emerald-400/80"
          aria-hidden
        />
      </footer>
    </div>
  )
}
