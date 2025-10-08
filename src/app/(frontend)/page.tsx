import { ExpensesChart } from '@/components/charts/expenses-chart'
import { DieselExpensesChart } from '@/components/charts/diesel-expenses-chart'
import { DieselAmountChart } from '@/components/charts/diesel-amount-chart'
import { CurrentMonthDieselLiters } from '@/components/charts/current-month-diesel-liters'
import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'
import { TenantsByBuildingChart } from '@/components/charts/tenants-by-building-chart'
import { GeneratorExpensesByCategoryChart } from '@/components/charts/generator-expenses-by-category-chart'
import { GeneratorHoursByDayChart } from '@/components/charts/generator-hours-by-day-chart'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Building Management Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Monitor expenses, diesel consumption, and payments across your building portfolio with
              comprehensive analytics and insights.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-10">
        <CurrentMonthDieselLiters />
        <PaymentsByBuildingChart />
        <TenantsByBuildingChart />
      </div>
      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ExpensesChart />
        <DieselExpensesChart />
        <GeneratorExpensesByCategoryChart />
        <DieselAmountChart />
        <GeneratorHoursByDayChart />
      </div>
    </div>
  )
}
