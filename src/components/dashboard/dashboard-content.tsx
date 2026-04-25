'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'
import { TenantsByBuildingChart } from '@/components/charts/tenants-by-building-chart'
import { ExpensesChart } from '@/components/charts/expenses-chart'
import { DieselExpensesChart } from '@/components/charts/diesel-expenses-chart'
import { GeneratorExpensesByCategoryChart } from '@/components/charts/generator-expenses-by-category-chart'
import { DieselAmountChart } from '@/components/charts/diesel-amount-chart'
import { GeneratorHoursByDayChart } from '@/components/charts/generator-hours-by-day-chart'
import { DashboardPeriodFilter, type DashboardPeriodValue } from '@/components/ui/dashboard-period-filter'
import { useState } from 'react'
import { GeneratorStatCards } from '@/components/charts/generator-stat-cards'

const defaultPeriod: DashboardPeriodValue = {
  preset: 'month',
}

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriodValue>(defaultPeriod)

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Building Management Dashboard
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
              Monitor expenses, diesel consumption, and payments across your building portfolio with
              comprehensive analytics and insights.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <DashboardPeriodFilter value={period} onChange={setPeriod} />
      </div>

      <GeneratorStatCards period={period} />

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-10">
        <PaymentsByBuildingChart />
        <TenantsByBuildingChart />
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ExpensesChart />
        <DieselExpensesChart />
        <GeneratorExpensesByCategoryChart />
        <DieselAmountChart />
        <GeneratorHoursByDayChart period={period} />
      </div>
    </div>
  )
}
