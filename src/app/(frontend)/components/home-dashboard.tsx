'use client'

import { useState } from 'react'
import {
  Banknote,
  BarChart3,
  Building,
  Fuel,
  Gauge,
} from 'lucide-react'

import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'
import { TenantsByBuildingChart } from '@/components/charts/tenants-by-building-chart'
import { ExpensesChart } from '@/components/charts/expenses-chart'
import { DieselExpensesChart } from '@/components/charts/diesel-expenses-chart'
import { GeneratorExpensesByCategoryChart } from '@/components/charts/generator-expenses-by-category-chart'
import { DieselAmountChart } from '@/components/charts/diesel-amount-chart'
import { DieselPricePerLiterChart } from '@/components/charts/diesel-price-per-liter-chart'
import { GeneratorHoursByDayChart } from '@/components/charts/generator-hours-by-day-chart'
import type { DashboardPeriodValue } from '@/components/ui/dashboard-period-filter'
import { GeneratorStatCards } from '@/components/charts/generator-stat-cards'
import { DieselOutstandingBalanceCard } from '@/components/charts/diesel-outstanding-balance-card'

import { DashboardHero } from './dashboard-hero'
import { DashboardSection } from './dashboard-section'

const defaultPeriod: DashboardPeriodValue = {
  preset: 'month',
}

export function HomeDashboard() {
  const [period, setPeriod] = useState<DashboardPeriodValue>(defaultPeriod)

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 p-4 sm:space-y-12 sm:p-6 lg:space-y-14 lg:p-8">
      <DashboardHero period={period} onPeriodChange={setPeriod} />

      <DashboardSection
        title="Generator & fuel snapshot"
        description="Key diesel and runtime metrics for the selected period, at a glance."
        icon={Gauge}
        iconClassName="text-amber-600 dark:text-amber-400"
      >
        <GeneratorStatCards period={period} />
      </DashboardSection>

      <DashboardSection
        title="Buildings, cash flow & occupancy"
        description="Outstanding diesel balance alongside rent collection and tenant distribution by building."
        icon={Building}
        iconClassName="text-sky-600 dark:text-sky-400"
      >
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-10">
          <DieselOutstandingBalanceCard />
          <PaymentsByBuildingChart />
          <TenantsByBuildingChart />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Costs, diesel trends & generator hours"
        description="Expense trends, fuel spend, price per liter, and daily generator activity for deeper operational insight."
        icon={BarChart3}
        iconClassName="text-violet-600 dark:text-violet-400"
      >
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-8">
          <ExpensesChart />
          <DieselExpensesChart />
          <GeneratorExpensesByCategoryChart />
          <DieselAmountChart />
          <DieselPricePerLiterChart />
          <GeneratorHoursByDayChart period={period} />
        </div>
      </DashboardSection>

      <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground sm:gap-3 sm:text-sm">
        <Fuel className="size-4 shrink-0 text-amber-600/80 dark:text-amber-400/80" aria-hidden />
        <span>Data reflects your configured reporting period and admin records.</span>
        <Banknote className="size-4 shrink-0 text-emerald-600/80 dark:text-emerald-400/80" aria-hidden />
      </footer>
    </div>
  )
}
